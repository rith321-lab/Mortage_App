import { Request, Response, NextFunction } from 'express';
import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { AppError, HttpStatus, createNotFoundError } from '../utils/AppError';

export interface BaseEntity extends ObjectLiteral {
  id: string;
}

export abstract class BaseController<T extends BaseEntity> {
  constructor(protected repository: Repository<T>) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.repository.find();
      res.json(items);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.repository.findOne({ 
        where: { id } as FindOptionsWhere<T>
      });

      if (!item) {
        throw createNotFoundError('Resource not found');
      }

      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newItem = this.repository.create(req.body);
      const savedItem = await this.repository.save(newItem);
      res.status(HttpStatus.CREATED).json(savedItem);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.findOneOrFail(id);
      
      const updatedItem = await this.repository.save({
        ...item,
        ...req.body,
      });

      res.json(updatedItem);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await this.findOneOrFail(id);
      
      await this.repository.remove(item);
      res.status(HttpStatus.OK).json({ message: 'Resource deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  protected async findOneOrFail(id: string): Promise<T> {
    const item = await this.repository.findOne({ 
      where: { id } as FindOptionsWhere<T>
    });
    
    if (!item) {
      throw createNotFoundError('Resource not found');
    }
    
    return item;
  }
} 