import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Property, PropertyType } from '../entities/Property';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const propertySchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zipCode: z.string(),
  propertyType: z.nativeEnum(PropertyType),
  purchasePrice: z.number().positive(),
  estimatedValue: z.number().positive(),
  yearBuilt: z.number().int().positive(),
  squareFeet: z.number().int().positive().optional(),
  lotSize: z.number().positive().optional(),
  numberOfBedrooms: z.number().int().positive().optional(),
  numberOfBathrooms: z.number().positive().optional(),
  propertyTax: z.number().positive().optional(),
  insuranceCost: z.number().positive().optional(),
  hoaFees: z.number().positive().optional(),
  metadata: z.record(z.any()).optional(),
});

export class PropertyController {
  private propertyRepository = AppDataSource.getRepository(Property);

  // Create new property
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const property = this.propertyRepository.create(req.body);
      const savedProperty = await this.propertyRepository.save(property);
      res.status(201).json(savedProperty);
    } catch (error) {
      next(error);
    }
  }

  // Get all properties
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const properties = await this.propertyRepository.find();
      res.json(properties);
    } catch (error) {
      next(error);
    }
  }

  // Get single property
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await this.propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      res.json(property);
    } catch (error) {
      next(error);
    }
  }

  // Update property
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await this.propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      await this.propertyRepository.update(id, req.body);
      const updatedProperty = await this.propertyRepository.findOne({
        where: { id }
      });

      res.json(updatedProperty);
    } catch (error) {
      next(error);
    }
  }

  // Delete property
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await this.propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      await this.propertyRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 