import { Router } from "express";
import {
  createPayslip,
  getPayslip,
  getPayslipById,
} from "../controllers/paySlipController.js";
import { protect, protectAdmin } from "../middleware/auth.js";

const paySlipRouter = Router();

paySlipRouter.post("/", protect, protectAdmin, createPayslip);
paySlipRouter.get("/", protect, getPayslip);
paySlipRouter.get("/:id", protect, getPayslipById);

export default paySlipRouter;
