const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const connectDB = require('./config/dbConnect');
const authRoutes = require('./routes/auth.Route');
const chatRoutes = require('./routes/chat.Route');
const statusRoutes = require('./routes/status.Route');

const http = require('http');
const initializeSocket = require('./services/socketService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true
}

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

// Creating http + socket server
const server = http.createServer(app);
const io = initializeSocket(server);

// Apply socket middleware before route
app.use((req,res,next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
})

app.use('/api/auth',authRoutes);
app.use('/api/chats',chatRoutes);
app.use('/api/status',statusRoutes);

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

// Handle unexpected crashes
process.on('unhandledRejection', (reason) => {
    console.error("Unhandled Rejection:", reason);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

startServer();

// connectDB();
// app.listen(PORT , () => {
//     console.log(`Server is running on port ${PORT}`);
// })