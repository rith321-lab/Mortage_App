import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities';
import { BaseController } from './base.controller';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';

export class UserController extends BaseController<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, phone, role = UserRole.BUYER } = req.body;

      // Check if user already exists
      const existingUser = await this.repository.findOne({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in database
      const newUser = this.repository.create({
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        role: role,
      } as Partial<User>);

      const savedUser = await this.repository.save(newUser);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser as User & { password: string };
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  };

  getByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      const user = await this.repository.findOne({
        where: { email }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user as User & { password: string };
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.repository.findOne({
        where: { id }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      await this.repository.remove(user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await this.repository.findOne({
        where: { id }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.role = role;
      const updatedUser = await this.repository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser as User & { password: string };
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  };
} 