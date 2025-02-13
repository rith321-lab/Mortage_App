import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';
import { User } from '../entities/User';
import { MortgageApplication } from '../entities/MortgageApplication';
import { Property } from '../entities/Property';
import { LoanDetails } from '../entities/LoanDetails';
import { BorrowerDetails } from '../entities/BorrowerDetails';
import { EmploymentHistory } from '../entities/EmploymentHistory';
import { Asset } from '../entities/Asset';
import { Liability } from '../entities/Liability';
import { Document } from '../entities/Document';

config({ path: path.resolve(__dirname, '../../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mortgage_app',
  synchronize: true,
  logging: true,
  entities: [
    User,
    MortgageApplication,
    Property,
    LoanDetails,
    BorrowerDetails,
    EmploymentHistory,
    Asset,
    Liability,
    Document
  ],
  migrations: [path.join(__dirname, '../migrations', '*.{ts,js}')],
}); 