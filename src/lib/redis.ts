import Redis from 'ioredis';

class RedisConnection {
  private static instance: Redis;
  private static isConnected: boolean = false;

  public static getInstance(): Redis {
    if (!RedisConnection.instance) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      RedisConnection.instance = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      // Connection event handlers
      RedisConnection.instance.on('connect', () => {
        console.log('Redis connecting...');
      });

      RedisConnection.instance.on('ready', () => {
        console.log('Redis connected successfully');
        RedisConnection.isConnected = true;
      });

      RedisConnection.instance.on('error', (error) => {
        console.error('Redis connection error:', error);
        RedisConnection.isConnected = false;
      });

      RedisConnection.instance.on('close', () => {
        console.log('Redis connection closed');
        RedisConnection.isConnected = false;
      });

      RedisConnection.instance.on('reconnecting', (ms: any) => {
        console.log(`Redis reconnecting in ${ms}ms`);
      });

      RedisConnection.instance.on('end', () => {
        console.log('Redis connection ended');
        RedisConnection.isConnected = false;
      });
    }

    return RedisConnection.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const redis = RedisConnection.getInstance();
      await redis.connect();
    } catch (error) {
      console.error('Redis connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      if (RedisConnection.instance) {
        await RedisConnection.instance.quit();
        console.log('Redis disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  public static isConnectionReady(): boolean {
    return RedisConnection.isConnected && RedisConnection.instance?.status === 'ready';
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const redis = RedisConnection.getInstance();
      const pong = await redis.ping();
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const redis = RedisConnection.getInstance();

// Helper functions
export const connectRedis = async (): Promise<void> => {
  await RedisConnection.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  await RedisConnection.disconnect();
};

export const redisHealthCheck = async (): Promise<boolean> => {
  return await RedisConnection.healthCheck();
};

export const isRedisReady = (): boolean => {
  return RedisConnection.isConnectionReady();
};

// Cache helper functions
export const setCache = async (
  key: string, 
  value: any, 
  ttl: number = 3600
): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttl, serialized);
  } catch (error) {
    console.error('Error setting cache:', error);
    throw error;
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    const result = await redis.del(key);
    return result === 1;
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
};

export const deleteCachePattern = async (pattern: string): Promise<number> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    const result = await redis.del(...keys);
    return result;
  } catch (error) {
    console.error('Error deleting cache pattern:', error);
    return 0;
  }
};

// Session helper functions
export const setSession = async (
  sessionId: string, 
  data: any, 
  ttl: number = 86400
): Promise<void> => {
  await setCache(`session:${sessionId}`, data, ttl);
};

export const getSession = async <T>(sessionId: string): Promise<T | null> => {
  return await getCache<T>(`session:${sessionId}`);
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  return await deleteCache(`session:${sessionId}`);
};

// Rate limiting helper
export const incrementCounter = async (
  key: string, 
  ttl: number = 3600
): Promise<number> => {
  try {
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, ttl);
    const results = await multi.exec();
    
    return results?.[0]?.[1] as number || 0;
  } catch (error) {
    console.error('Error incrementing counter:', error);
    return 0;
  }
};

// Pub/Sub helpers
export const publishMessage = async (
  channel: string, 
  message: any
): Promise<void> => {
  try {
    const serialized = JSON.stringify(message);
    await redis.publish(channel, serialized);
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
};

export const subscribeToChannel = (
  channel: string, 
  callback: (message: any) => void
): Redis => {
  const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  subscriber.subscribe(channel);
  subscriber.on('message', (receivedChannel, message) => {
    if (receivedChannel === channel) {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (error) {
        console.error('Error parsing subscribed message:', error);
        callback(message);
      }
    }
  });

  return subscriber;
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing Redis connection...');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing Redis connection...');
  await disconnectRedis();
  process.exit(0);
});