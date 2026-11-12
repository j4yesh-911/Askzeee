
import mongoose from "mongoose";

let cached = globalThis.mongooseConnection;

if (!cached) {
  cached = globalThis.mongooseConnection = {
    connection: null,
    promise: null
  };
}

const connectDB = async () => {
  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI)
      .then(mongoose => {
        console.log("MongoDB connected successfully!");
        return mongoose;
      })
      .catch(error => {
        cached.promise = null;
        throw error;
      });
  }

  cached.connection = await cached.promise;
  return cached.connection;
};

export default connectDB;
