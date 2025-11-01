const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}


const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = connectDB;
