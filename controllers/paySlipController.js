import Employee from "../models/Employee.js";
import PaySlip from "../models/PaySlip.js";

export const createPayslip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } =
      req.body;

    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(404).json({ error: "Missing fields" });
    }
    const netSalary =
      Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

    const paySlip = await PaySlip.create({
      employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      netSalary,
    });

    return res.json({ success: true, data: paySlip });
  } catch (error) {
    return res.json({ error: "Failed" });
  }
};

export const getPayslip = async (req, res) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";
    if (isAdmin) {
      const paySlip = await PaySlip.find()
        .populate("employeeId")
        .sort({ createdAt: -1 });
      const data = paySlip.map((p) => {
        const obj = p.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId,
          employeeId: obj.employeeId?._id?.toString(),
        };
      });
      return res.json({ data });
    } else {
      const employee = await Employee.findOne({ userId: session.userId });
      if (!employee) {
        return res.status(404).json({ error: "Not found" });
      }
      const paySlips = await PaySlip.find({ employeeId: employee._id }).sort({
        createdAt: -1,
      });
      return res.json({ data: paySlips });
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: "Failed" });
  }
};

export const getPayslipById = async (req, res) => {
  try {
    const paySlip = await PaySlip.findById(req.params.id)
      .populate("employeeId")
      .lean();
    if (!paySlip) {
      return res.status(404).json({ error: "Not Found" });
    }

    const result = {
      ...paySlip,
      id: paySlip._id.toString(),
      employee: paySlip.employeeId,
      // employeeId: paySlip.employeeId?._id.toString(),
    };

    return res.json(result);
  } catch (error) {
    return res.json({ error: "Failed" });
  }
};
