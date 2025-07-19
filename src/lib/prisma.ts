import { PrismaClient } from '@prisma/client';

// Global variable to store the PrismaClient instance
declare global {
  var __prisma: PrismaClient | undefined;
}

class PrismaConnection {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaConnection.instance) {
      // In development, use global variable to prevent multiple instances
      if (process.env.NODE_ENV === 'development') {
        if (!global.__prisma) {
          global.__prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
            errorFormat: 'pretty',
          });
        }
        PrismaConnection.instance = global.__prisma;
      } else {
        // In production, create a new instance
        PrismaConnection.instance = new PrismaClient({
          log: ['warn', 'error'],
          errorFormat: 'minimal',
        });
      }

      // Add connection event handlers
      PrismaConnection.instance.$on('beforeExit', async () => {
        console.log('Prisma is shutting down...');
      });
    }

    return PrismaConnection.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = PrismaConnection.getInstance();
      await prisma.$connect();
      console.log('Prisma connected successfully');
    } catch (error) {
      console.error('Prisma connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const prisma = PrismaConnection.getInstance();
      await prisma.$disconnect();
      console.log('Prisma disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from Prisma:', error);
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = PrismaConnection.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Prisma health check failed:', error);
      return false;
    }
  }
}

// Export the singleton instance
export const prisma = PrismaConnection.getInstance();

// Helper functions
export const connectPrisma = async (): Promise<void> => {
  await PrismaConnection.connect();
};

export const disconnectPrisma = async (): Promise<void> => {
  await PrismaConnection.disconnect();
};

export const prismaHealthCheck = async (): Promise<boolean> => {
  return await PrismaConnection.healthCheck();
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing Prisma connection...');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing Prisma connection...');
  await disconnectPrisma();
  process.exit(0);
});

// Auto-connect in development
if (process.env.NODE_ENV === 'development') {
  connectPrisma().catch(console.error);
}