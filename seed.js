import "dotenv/config";
import connectDb from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

const TemporaryPassword = "admin@123";

async function registerAdmin() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!ADMIN_EMAIL) {
      console.log("Missing admin email");
      process.exit(1);
    }
    await connectDb();

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("User already exists as role", existingAdmin.role);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(TemporaryPassword, 10);

    const admin = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });
    console.log("Admin created");
    console.log("\nemail", admin.email);
    process.exit(0);
  } catch (error) {
    console.log("seed failed:", error);
  }
}

registerAdmin();
