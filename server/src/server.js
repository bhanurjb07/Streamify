import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import 'dotenv/config';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';

const app =express();
const PORT=process.env.PORT || 4001;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req,res)=>{
    res.send("API Working..");
})

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

///Server and database connection
const startServer=async ()=>{
    await connectDB();

    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
    });
}
startServer();