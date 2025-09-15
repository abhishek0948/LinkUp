const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const connectDB = require('./config/dbConnect');
const authRoutes = require('./routes/auth.Route');
const chatRoutes = require('./routes/chat.Route');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);

const startServer = async () => {
    try {
        await connectDB();  
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