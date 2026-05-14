import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});

connectDB()
    .then(() => {
        (app as any).on("error", (error: any) => {
            console.log("ERR: ", error);
            throw error;
        });
        
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err: any) => {
        console.log("MONGO db connection failed !!! ", err);
    });
