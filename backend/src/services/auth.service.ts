import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { AppError } from '../utils/AppError';
import { supabaseAdmin } from '../config/supabase';

interface Permission {
  name: string;
  description: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async signUp(email: string, password: string, firstName: string, lastName: string, role: UserRole = UserRole.BUYER, phone?: string) {
    try {
      // Create user in Supabase Auth
      const { data: { user: supabaseUser }, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          firstName,
          lastName,
          role,
          phone
        },
      });

      if (authError) {
        throw new AppError('Failed to create Supabase auth user', 400);
      }

      if (!supabaseUser) {
        throw new AppError('Failed to create user with Supabase Auth', 500);
      }

      // Create user in our database with TypeORM
      const newUser = this.userRepository.create({
        email,
        firstName,
        lastName,
        role,
        phone,
        supabaseId: supabaseUser.id
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Signup failed', 500);
    }
  }

  async signIn(email: string, password: string) {
    try {
      // Authenticate with Supabase
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AppError('Invalid credentials', 401);
      }

      if (!data.user || !data.session) {
        throw new AppError('Authentication failed', 401);
      }

      // Get user from our database
      const user = await this.userRepository.findOne({
        where: { supabaseId: data.user.id }
      });

      if (!user) {
        throw new AppError('User not found in database', 404);
      }

      return {
        user,
        session: data.session
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Sign in failed', 500);
    }
  }

  async verifySession(token: string): Promise<User> {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        throw new AppError('Invalid session', 401);
      }

      const dbUser = await this.userRepository.findOne({
        where: { supabaseId: user.id }
      });

      if (!dbUser) {
        throw new AppError('User not found in database', 404);
      }

      return dbUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Session verification failed', 500);
    }
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Add your permission logic here based on user role
    switch (permissionName) {
      case 'view_all_applications':
        return user.role === UserRole.LENDER;
      case 'verify_documents':
        return user.role === UserRole.LENDER;
      case 'manage_users':
        return false; // Only admin can manage users
      default:
        return false;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email }
    });
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { supabaseId }
    });
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update role in Supabase
    const { error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(
      user.supabaseId!,
      {
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role
        }
      }
    );

    if (supabaseError) {
      throw new AppError('Failed to update user role in Supabase', 500);
    }

    // Update role in our database
    user.role = role;
    return await this.userRepository.save(user);
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update metadata in Supabase
    const { error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(
      user.supabaseId!,
      {
        user_metadata: {
          firstName: data.firstName || user.firstName,
          lastName: data.lastName || user.lastName,
          phone: data.phone || user.phone,
          role: data.role || user.role
        }
      }
    );

    if (supabaseError) {
      throw new AppError('Failed to update user profile in Supabase', 500);
    }

    // Update in our database
    Object.assign(user, data);
    return await this.userRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete from Supabase first
    const { error: supabaseError } = await supabaseAdmin.auth.admin.deleteUser(
      user.supabaseId!
    );

    if (supabaseError) {
      throw new AppError('Failed to delete user from Supabase', 500);
    }

    // Delete from our database
    await this.userRepository.remove(user);
  }
} 