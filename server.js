import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import connectDb from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import employeeRouter from "./routes/employeeroutes.js";
import profileRouter from "./routes/profileRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import leaveRouter from "./routes/leaveroute.js";
import paySlipRouter from "./routes/Paysliproute.js";
import dashboardRouter from "./routes/dasBoardRoute.js";

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(multer().none());

app.get("/", (req, res) => {
  res.send("api is ready for production apps");
});

app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/payslips", paySlipRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));

await connectDb();

app.listen(PORT, () => {
  console.log(`serever is running on ${PORT}`);
});
