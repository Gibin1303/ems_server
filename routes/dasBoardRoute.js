import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getDashBoard } from "../controllers/dashBoardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/", protect, getDashBoard);

export default dashboardRouter;
