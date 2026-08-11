import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: `ConvoSphere <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });

  if (process.env.SMTP_HOST.includes("ethereal")) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};