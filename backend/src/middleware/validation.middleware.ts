import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { createValidationError } from '../utils/AppError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against schema
      await schema.parseAsync(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

// Example usage:
// router.post('/users', validate(createUserSchema), userController.createUser); 