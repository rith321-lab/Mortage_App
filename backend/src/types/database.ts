export interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  ssl?: boolean | {
    rejectUnauthorized: boolean;
  };
} 