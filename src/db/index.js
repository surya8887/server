import mongoose from "mongoose";
import { dB_NAME } from "../constant.js";

const DBConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${dB_NAME}`
    );

    console.log(
      `✅ Connected to MongoDB: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default DBConnection;
