import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

// Export individual functions instead of a class
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError(401, error.message);
    }

    res.json({
      token: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    console.log('Signup attempt:', { email, name, role });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw new AppError(400, error.message);
    }

    res.status(201).json({
      message: 'Signup successful',
      user: data.user
    });
  } catch (error) {
    next(error);
  }
};

// Export other functions similarly...
export const resetPasswordRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      throw new AppError(400, error.message);
    }

    res.json({
      message: 'If an account exists, you will receive a password reset email'
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new AppError(400, error.message);
    }

    res.json({ message: 'Password successfully updated' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new AppError(401, 'Not authenticated');
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AppError(400, error.message);
    }

    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    next(error);
  }
};

// Add MFA methods
export const setupMFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });

    if (error) throw new AppError(400, error.message);

    res.json({
      qr: data.totp.qr_code,
      secret: data.totp.secret
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: req.user!.id,
      code
    });

    if (error) throw new AppError(400, error.message);

    res.json({ message: 'MFA verified successfully' });
  } catch (error) {
    next(error);
  }
}; 