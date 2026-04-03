import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined.');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected.');
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

/*
FILE: src/configs/db.js
ROLE: Database configuration module. Establishes and monitors the Mongoose connection to MongoDB. Terminates the Node.js process on critical failures to prevent the server from running without a database.

FUNCTIONS / LOGIC:
  - connectDB() — async function that reads MONGO_URI from environment variables, calls mongoose.connect() to open the database connection, logs the connected database name, and registers 'error' and 'disconnected' event listeners on the connection. If MONGO_URI is not defined or the initial connection throws, it logs the error and calls process.exit(1) to halt the server immediately.

IMPORTED BY:
  - server.js — imports connectDB as the default export and calls it at startup before app.listen().
*/
