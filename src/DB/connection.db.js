import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { models } = await mongoose.connect(process.env.DB_URI);
    console.log({ models });
    console.log("DB Connected successfully");
  } catch (error) {
    console.log({ error });
    console.log("DB Falid to connect");
  }
};
