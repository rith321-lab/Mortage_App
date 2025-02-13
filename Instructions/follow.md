Delete the backend/supabase directory and all its contents. This is for Supabase direct migrations, which we are not using.

Delete these files (they are not needed with TypeORM):

backend/src/db/connect.ts

backend/src/db/init.ts

backend/src/db/migrate.ts

backend/src/db/test-connection.ts

All .sql files inside backend/src/db/migrations/. Keep the directory itself, but empty it.

Remove Supabase client instantiation:
Modify backend/src/config/supabase.ts to eliminate supabaseClient and only have supabaseAdmin.

// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or service role key.');
}

// Create Supabase admin client with service role key for admin operations.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});


// Types for Supabase user metadata
export interface UserMetadata {
  role?: 'buyer' | 'lender' | 'admin';
  firstName?: string;
  lastName?: string;
  phone?: string;
}
Use code with caution.
TypeScript
Step 2: Backend - TypeORM Configuration and Entities

Ensure backend/tsconfig.json is correct: It should have "moduleResolution": "node" (or "bundler" is also fine, but be consistent). Make sure rootDir and outDir are correct, and that you're including your src directory. The provided tsconfig.json looks mostly correct, just double-check these settings.

backend/src/config/database.ts: This file should look exactly like this (adjust paths if necessary):

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';
import { User } from '../entities/User'; // Import your User entity

config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password', // CHANGE THIS!
  database: process.env.DB_NAME || 'mortgage_app',
  synchronize: process.env.NODE_ENV === 'development', // ONLY in development!
  logging: process.env.NODE_ENV === 'development',
  entities: [User, /* ... other entities */],
  migrations: [path.join(__dirname, '../db/migrations', '*.{ts,js}')],
};

export const AppDataSource = new DataSource(dbConfig);

// Initialize the DataSource
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err)
    process.exit(1); // Exit if the database connection fails.
  });

  export default AppDataSource;
Use code with caution.
TypeScript
Create backend/src/entities directory.

Correct backend/src/entities/User.ts:

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
    import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsIn } from 'class-validator';
    import { MortgageApplication } from './MortgageApplication'; // Import when you create it

    export enum UserRole {
        BUYER = 'buyer',
        LENDER = 'lender',
        ADMIN = 'admin',
    }

    @Entity('users') // Matches the table name
    export class User {
      @PrimaryGeneratedColumn('uuid')
      id: string;

      @Column({ nullable: true }) //  Make nullable, since you decided that.
      firstName?: string; // Use correct casing

      @Column({ nullable: true }) //  Make nullable
      lastName?: string;      // Use correct casing


      @Column({ unique: true })
      @IsEmail()
      @IsNotEmpty()
      email: string;

      @Column({ name: 'password_hash' }) // Correct column name for hashed password
      @IsNotEmpty()
      @MinLength(8)
      passwordHash: string; // Store the *hashed* password, not the plain text

      @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.BUYER,
      })
      role: UserRole;

      @Column({ nullable: true })
      phone?: string;


      @Column({ name: 'supabase_id', unique: true, nullable: true }) //For the supabase UID
      supabaseId?: string;

      @CreateDateColumn({ name: 'created_at' }) // Use snake_case
      createdAt: Date;

      @UpdateDateColumn({ name: 'updated_at' }) // Use snake_case
      updatedAt: Date;


        // One-to-many relationship with MortgageApplication
      @OneToMany(() => MortgageApplication, application => application.user)
      applications: MortgageApplication[];

    }
Use code with caution.
TypeScript
I have removed validation that is to be handled by the zod schemas in the controllers. The @Column decorators are all that you really need here.

I am using first_name and last_name separate, as originally found in your migration files.

I have added the supabaseId so you can associate the entity with the user in the database.

Create Other Entities: Create other entities as in my previous answer, following TypeORM conventions.

STEP 4: Backend - Authentication Controller (auth.controller.ts)

Remove bcrypt and jsonwebtoken: You will not be using these directly. Supabase Auth handles this.

Replace everything inside the login function, and use this new function instead:

export const login = async (req: Request, res: Response, next: NextFunction) => {
 try {
   const { email, password } = loginSchema.parse(req.body); //validation with zod

   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   });

     if (error) throw error;
     if(!data.user) throw new Error('Could not get user from Supabase.');


     const userRepository = AppDataSource.getRepository(User);
     const user = await userRepository.findOne({where: {email}});


   return res.json({
     token: data.session?.access_token, // Return the Supabase token
     user: {
        id: user.id,   // From YOUR database, as this is your unique id for internal use
        email: user.email, // From your database
        firstName: user.firstName, //From your database,
        lastName: user.lastName,
        role: user.role //From your database.
      },
   });
 } catch (error) {
   next(error);
 }
};
Use code with caution.
TypeScript
Modify signup to only use Supabase and TypeORM, as mentioned above:

export const signup = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { email, password, firstName, lastName, role } = signupSchema.parse(req.body);

          // Create user in Supabase
          const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true, // Very important!
              user_metadata: {
                  firstName, // Correct key names
                  lastName,
                  role,
              },
          });

          if (authError) {
              throw authError;
          }
          if (!user) {
              throw new Error("Failed to create user with Supabase Auth.");
          }

          // Create user in YOUR database.
          const userRepository = AppDataSource.getRepository(User);
          const newUser = userRepository.create({
              email,
              firstName, // Use correct field names
              lastName,
              role,
              supabaseId: user.id, // Store the Supabase UUID
              phone: req.body.phone // if you have a phone number
          });

          const savedUser = await userRepository.save(newUser);

          res.status(201).json({
              user: {
                  id: savedUser.id, // Use your internal ID
                  email: savedUser.email,
                  firstName: savedUser.firstName, // Use correct names
                  lastName: savedUser.lastName,
                  role: savedUser.role
              }
          });


      } catch (error) {
          next(error);
      }
  }
Use code with caution.
TypeScript
Remove the token from the returned data in the signup. You don't need it here, because the user is not automatically logged in.

Implement getCurrentUser using req.user (populated by your authMiddleware).

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
 try {
  if (!req.user) {
     throw new AppError(401, "Not authenticated");
  }

     const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: req.user.id }
      });

   if (!user) {
     return res.status(404).json({ error: 'User not found' }); //Should never happen, but...
   }
     res.json({ user });

 } catch (error) {
   next(error);
 }
};
Use code with caution.
TypeScript
Implement logout. The frontend should clear the local storage, so you do not need to make a backend call.

STEP 5: Frontend - Auth Context and Hook

Delete frontend/src/contexts/AuthContext.tsx ENTIRELY.

Modify frontend/src/hooks/useAuth.ts: It should look exactly like the example I provided in the previous response. Make sure you're using supabaseClient.auth for all authentication actions. Remove any calls to api/auth/....

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabaseClient } from '@/lib/supabase'; //IMPORT THE SUPABASE CLIENT.
import { User } from '@supabase/supabase-js'; // Use the User type from Supabase

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: Error | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>; // Add this
    updateProfile: (data: Partial<User>) => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
    // Check active sessions and sets the user
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUser(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    }, []);


    async function fetchUser(userId:string) {
        try {
          const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('supabase_id', userId) //use the supabase id
            .single();

          if (error) throw error;

         const user : User = {
            id: data.id,
            email: data.email,
            name: `${data.first_name} ${data.last_name}`,
            role: data.role
         }
        setUser(user);
        } catch (error) {
          console.error('Error fetching user:', error);
          setError(error as Error);
        } finally {
          setLoading(false);
        }
      }



    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
        });
        if (error) throw error;
        setUser(data.user); // This will trigger a refetch with onAuthStateChange
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string, role: string = 'buyer') => {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
            data: {
                role,
                first_name: firstName, // Use correct key names
                last_name: lastName  // Use correct key names

            }
            }

        });
        if (error) throw error;
        console.log("user", data.user)
        setUser(data.user);

    };

    const signOut = async () => {
        await supabaseClient.auth.signOut();
        setUser(null); // Clear user after sign out
    }

    const resetPassword = async (email: string) => {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    }

    const updateProfile = async (data: Partial<User>) => {
        const {error} = await supabaseClient.auth.updateUser({
          data
        })
        if(error) throw error
        if(user?.id) await fetchUser(user.id);
    }
    
    const value = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile

    } as AuthContextType

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
const context = useContext(AuthContext);
if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};
Use code with caution.
TypeScript
Frontend API Calls: All API calls should now go through src/lib/axios.ts, and this file must not have the request interceptor that adds the Authorization header. Supabase Auth handles that for you.

Remove frontend/src/config/api.ts: This file is no longer needed.

Remove frontend/src/api/auth.ts: This file is no longer needed.