const resetPasswordEmail = (name, resetLink) => {
  return `
    <div style="font-family: Arial; max-width:600px;margin:auto">
      <h2>Hello ${name},</h2>

      <p>You requested to reset your password.</p>

      <p>
        <a href="${resetLink}"
           style="
           background:#4f46e5;
           color:white;
           padding:12px 18px;
           text-decoration:none;
           border-radius:6px;">
           Reset Password
        </a>
      </p>

      <p>This link will expire in 15 minutes.</p>

      <p>If you didn't request this, ignore this email.</p>

      <br/>

      <b>ConvoSphere Team</b>
    </div>
  `;
};

export default resetPasswordEmail;