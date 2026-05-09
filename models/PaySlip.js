import mongoose from "mongoose";

const paySlipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, required: true },
    deductions: { type: Number, required: true },
    netSalary: { type: Number, required: true },
  },
  { timestamps: true },
);

const PaySlip = mongoose.models.paySlip || mongoose.model("PaySlip", paySlipSchema);

export default PaySlip;
