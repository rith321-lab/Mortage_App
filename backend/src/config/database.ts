import { DataSource } from 'typeorm';
import path from 'path';
import { config } from 'dotenv';
import { MortgageApplication } from '../entities/MortgageApplication';
import { Property } from '../entities/Property';
import { LoanDetails } from '../entities/LoanDetails';
import { BorrowerDetails } from '../entities/BorrowerDetails';
import { Asset } from '../entities/Asset';
import { Liability } from '../entities/Liability';
import { Document } from '../entities/Document';

config({ path: path.resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mortgage_app',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    MortgageApplication,
    Property,
    LoanDetails,
    BorrowerDetails,
    Asset,
    Liability,
    Document
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
    throw error;
  }
};