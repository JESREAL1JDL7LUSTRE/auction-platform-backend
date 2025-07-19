import mongoose from 'mongoose';

class MongooseConnection {
  private static instance: MongooseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongooseConnection {
    if (!MongooseConnection.instance) {
      MongooseConnection.instance = new MongooseConnection();
    }
    return MongooseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('MongoDB is already connected');
      return;
    }

    try {
      const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/devdb';
      
      await mongoose.connect(mongoUrl, {
        // Modern connection options
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });

      this.isConnected = true;
      console.log('MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnection() {
    return mongoose.connection;
  }

  public isConnectionReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
export const mongooseConnection = MongooseConnection.getInstance();

// Helper function for easy connection
export const connectMongoDB = async (): Promise<void> => {
  await mongooseConnection.connect();
};

// Helper function for disconnection
export const disconnectMongoDB = async (): Promise<void> => {
  await mongooseConnection.disconnect();
};

// Export mongoose for schema definitions
export { mongoose };

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing MongoDB connection...');
  await disconnectMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing MongoDB connection...');
  await disconnectMongoDB();
  process.exit(0);
});