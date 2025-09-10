const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConnect');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();  // wait until DB is connected
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

// connectDB();
// app.listen(PORT , () => {
//     console.log(`Server is running on port ${PORT}`);
// })