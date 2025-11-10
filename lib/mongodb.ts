import mongoose from 'mongoose';

/**
 * Type definition for the Mongoose connection object
 * This ensures type safety when working with the connection
 */
type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

/**
 * Global variable to cache the Mongoose connection
 * In Next.js, during development, modules can be reloaded due to hot module replacement (HMR),
 * which would create multiple connections without this caching mechanism.
 * 
 * Using a global variable ensures we maintain a single connection instance
 * across all module reloads in development and production.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}

/**
 * Initialize the cached connection object if it doesn't exist
 * This pattern prevents re-initialization on every module reload
 */
const cached: MongooseConnection = global.mongoose ?? {
  conn: null,
  promise: null,
};

// Store the cached connection in the global object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose
 * 
 * This function implements connection caching to prevent multiple connections:
 * 1. If already connected, returns the existing connection
 * 2. If a connection is in progress, returns the existing promise
 * 3. Otherwise, creates a new connection and caches it
 * 
 * @returns Promise that resolves to the Mongoose instance
 * @throws Error if MONGODB_URI is not defined
 */
async function connectDB(): Promise<typeof mongoose> {
  // Validate that the MongoDB URI is defined
  const mongoDbUri = process.env.MONGODB_URI;
  if (!mongoDbUri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // If already connected, return the cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is in progress, return the existing promise
  // This prevents multiple simultaneous connection attempts
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create the connection promise
    cached.promise = mongoose
      .connect(mongoDbUri, opts)
      .then((mongooseInstance) => {
        // Connection successful
        console.log('✅ MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error) => {
        // Connection failed - clear the promise so we can retry
        cached.promise = null;
        console.error('❌ MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the cached promise
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Default export for convenience
 * Import this function in your API routes or server components
 * 
 * @example
 * import connectDB from '@/lib/mongodb';
 * await connectDB();
 */
export default connectDB;
