import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDatabase = async (mongoUrl) => {
  try {
    const connectionInstance = await mongoose.connect(`${mongoUrl}/${DB_NAME}`);

    console.log(
      `\n Mongo Connected!! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongo Error", error);
    process.exit(1);
  }
};

export default connectDatabase;
