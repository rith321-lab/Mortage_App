import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mortgage_app',
  entities: [join(__dirname, 'src/entities/**/*.{ts,js}')],
  migrations: [join(__dirname, 'src/db/migrations/**/*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}); 