import mongoose from 'mongoose';

const connectDB =async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected");
    }catch(err){
        console.log("MongoDB Connection Error:",err.message);
        process.exit(1);
    }
};

export default connectDB; 