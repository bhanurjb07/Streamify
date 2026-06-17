import express from 'express';
import 'dotenv/config';
const app =express();

const PORT=process.env.PORT || 5001;

app.get('/', (req,res)=>{
    res.send("API Working..");
})

///server start
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})