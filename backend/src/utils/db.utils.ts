import { AppDataSource } from '../config/database';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export async function executeQuery<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  queryCallback: (repository: Repository<T>) => Promise<any>
): Promise<any> {
  try {
    const repository = AppDataSource.getRepository(entity);
    return await queryCallback(repository);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function executeTransaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const result = await callback();
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 