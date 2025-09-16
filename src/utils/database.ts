import mongoose from 'mongoose';
import { config } from '../config';

export class DatabaseConnection {
  static async connect(): Promise<void> {
    try {
      await mongoose.connect(config.database.mongoUri);
      console.log('Connected to MongoDB successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }

  static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}