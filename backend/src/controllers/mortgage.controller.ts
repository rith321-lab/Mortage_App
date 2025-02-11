import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

export class MortgageController {
  // Create a new mortgage application
  public createApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const applicationData = {
        ...req.body,
        userId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { data, error } = await supabase
        .from('mortgage_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) {
        throw new AppError(400, error.message);
      }

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  };

  // Update an existing application
  public updateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const { data: existingApp, error: fetchError } = await supabase
        .from('mortgage_applications')
        .select()
        .eq('id', id)
        .single();

      if (fetchError || !existingApp) {
        throw new AppError(404, 'Application not found');
      }

      if (existingApp.userId !== userId) {
        throw new AppError(403, 'Not authorized to update this application');
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const { data, error } = await supabase
        .from('mortgage_applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Get a specific application
  public getApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const { data, error } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          documents (*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new AppError(404, 'Application not found');
      }

      if (data.userId !== userId) {
        throw new AppError(403, 'Not authorized to view this application');
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Get all applications for a user
  public getUserApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      const { data, error } = await supabase
        .from('mortgage_applications')
        .select(`
          *,
          documents (*)
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  // Submit an application for review
  public submitApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const { data: existingApp, error: fetchError } = await supabase
        .from('mortgage_applications')
        .select()
        .eq('id', id)
        .single();

      if (fetchError || !existingApp) {
        throw new AppError(404, 'Application not found');
      }

      if (existingApp.userId !== userId) {
        throw new AppError(403, 'Not authorized to submit this application');
      }

      const { data, error } = await supabase
        .from('mortgage_applications')
        .update({
          status: 'submitted',
          updatedAt: new Date()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AppError(400, error.message);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  };
} 