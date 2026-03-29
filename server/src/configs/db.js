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
