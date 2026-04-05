import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_DB_URI;
        if (!uri) {
            console.error("❌ MONGODB_URI or MONGO_DB_URI is not defined in environment variables");
            process.exit(1);
        }
        
        // Connect directly if URI contains database name or query strings
        const connectionInstance = await mongoose.connect(uri.includes("?") || uri.endsWith("/") ? uri : `${uri}/devmeet`);
        console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("❌ MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB;
