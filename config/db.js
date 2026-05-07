import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        mongoose.connection.on('connected',()=>{
            console.log("database connected successfully")
        })
        await mongoose.connect(process.env.MONGODB_URL)
    }catch(error){
      console.log("database connection failed", error.message)
    }
}

export default connectDb