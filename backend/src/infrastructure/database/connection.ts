// Import TypeORM and dotenv
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { RouteModel } from '../../adapters/outbound/postgres/models/RouteModel';
import { BankingRecordModel } from '../../adapters/outbound/postgres/models/BankingRecordModel';

dotenv.config();

/**
 * Database Connection Configuration
 * 
 * This creates a connection to PostgreSQL database.
 * It uses environment variables for security.
 */

export const AppDataSource = new DataSource({
  
  // Database type
  type: 'postgres',
  
  // Connection details from .env file
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'fueleu_db',
  
    // Auto-create/update tables based on models
  // Use only in development!
  synchronize: true,
  
  // Show SQL queries in console for debugging
  logging: true,
  
  // All database models (entities)
  entities: [RouteModel, BankingRecordModel],
  
  // Migrations folder
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  
  // Subscribers (advanced feature, not needed now)
  //   subscribers: [],
});

/**
 * Initialize Database Connection
 * 
 * Call this function to connect to the database
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Try to connect
    await AppDataSource.initialize();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error(' Database connection failed:', error);
    // Exit if database fails (app can't work without DB)
    process.exit(1);
  }
};