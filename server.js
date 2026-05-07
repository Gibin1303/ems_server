import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import connectDb from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 4000;


// middlewares
app.use(cors())
app.use(express.json())
app.use(multer().none())





app.get("/",(req,res)=>{
    res.send("api is ready for production apps")
})

await connectDb()
app.listen(PORT,()=>{
    console.log(`serever is runnong on ${PORT}`)
})
