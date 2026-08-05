const otpEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
      <h2>Welcome to ConvoSphere 👋</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>Your verification code is:</p>

      <h1 style="letter-spacing:8px; color:#2563eb;">
        ${otp}
      </h1>

      <p>This OTP will expire in <strong>10 minutes</strong>.</p>

      <p>If you didn't request this email, please ignore it.</p>

      <hr />

      <small>
        ConvoSphere Security Team
      </small>
    </div>
  `;
};

export default otpEmailTemplate;