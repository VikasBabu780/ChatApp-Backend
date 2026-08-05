import "./config/env.js";
import http from "http";

import app from "./app.js";
import connectDB from "./config/db.js";



const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        // Connect Database
        await connectDB();

        // Create HTTP Server
        const server = http.createServer(app);

        // Start Server
        server.listen(PORT, () => {
            console.log(` Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();