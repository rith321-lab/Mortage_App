import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { MortgageApplication } from '../entities/MortgageApplication';
import { Document } from '../entities/Document';
import { Property } from '../entities/Property';
import { LoanDetails } from '../entities/LoanDetails';
import { BorrowerDetails } from '../entities/BorrowerDetails';

export async function clearDatabase() {
  const entities = [
    Document,
    MortgageApplication,
    Property,
    LoanDetails,
    BorrowerDetails,
    User
  ];

  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity);
    await repository.clear();
  }
}

export async function setupTestDatabase() {
  // Wait for database connection
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  // Clear all data
  await clearDatabase();
}

export async function teardownTestDatabase() {
  // Clear all data
  await clearDatabase();

  // Close database connection
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
} 