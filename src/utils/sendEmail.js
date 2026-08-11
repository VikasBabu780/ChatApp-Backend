export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "ConvoSphere",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ BREVO API ERROR:");
      console.error("Status:", response.status);
      console.error("Response:", data);

      return false;
    }

    console.log("✅ OTP email sent successfully");
    console.log("Brevo Message ID:", data.messageId);

    return true;
  } catch (error) {
    console.error("❌ BREVO CONNECTION ERROR:", error.message);
    return false;
  }
};