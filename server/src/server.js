import express from 'express';
import connectDB from './config/db.js';
import 'dotenv/config';
import authRoutes from './routes/auth.route.js';

const app =express();
const PORT=process.env.PORT || 4001;

app.get('/', (req,res)=>{
    res.send("API Working..");
})

app.use("/api/auth", authRoutes);

///Server and database connection
const startServer=async ()=>{
    await connectDB();

    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
    });
}
startServer();