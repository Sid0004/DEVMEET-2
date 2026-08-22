import "dotenv/config";
import http from "http";
import connectDB from "./src/db/index.js";
import { app } from "./app.js";
import { initSocket } from "./src/socket/index.js";

const server = http.createServer(app);

// Initialize modular Socket.IO server
initSocket(server);

connectDB()
    .then(() => {
        server.on("error", (error) => {
            console.log("ERR: ", error);
            throw error;
        });
        server.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

// trigger nodemon restart
