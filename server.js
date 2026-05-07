import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import connectDb from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import employeeRouter from "./routes/employeeroutes.js";
import profileRouter from "./routes/profileRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;


// middlewares
app.use(cors())
app.use(express.json())
app.use(multer().none())





app.get("/",(req,res)=>{
    res.send("api is ready for production apps")
})

app.use("/api/auth", authRouter)
app.use("/api/employees", employeeRouter)
app.use("/api/profile", profileRouter)
app.use("/api/attendance", attendanceRouter)



await connectDb()
app.listen(PORT,()=>{
    console.log(`serever is runnong on ${PORT}`)
})
