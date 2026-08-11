import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

console.log("Starting email test with IPv4 only...");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
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
