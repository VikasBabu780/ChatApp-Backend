import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("Starting email test...");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  logger: true,
  debug: true
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Verify error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
  process.exit();
});
