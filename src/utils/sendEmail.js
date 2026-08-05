import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Keep false for port 2525
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.verify();
  // console.log(" SMTP Connected Successfully");

  const info = await transporter.sendMail({
    from: `ConvoSphere <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });

  // console.log("Email sent:", info.messageId);
};