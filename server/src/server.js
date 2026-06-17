import express from 'express';
import connectDB from './config/db.js';
import 'dotenv/config';
const app =express();

const PORT=process.env.PORT || 4001;

app.get('/', (req,res)=>{
    res.send("API Working..");
})

///Server and database connection
const startServer=async ()=>{
    await connectDB();

    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
    });
}
startServer();