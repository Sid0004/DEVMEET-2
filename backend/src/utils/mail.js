import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendOtpEmail(to, otp) {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: '"DEVMEET" <noreply@devmeet.com>',
    to,
    subject: `Your DEVMEET Verification Code: ${otp}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px;">DEVMEET</h1>
        </div>
        <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Verify Your Email Address</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563; margin: 0 0 20px 0;">
          Welcome to DEVMEET! Please use the 6-digit verification code below to complete your registration:
        </p>
        <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; text-align: center; font-family: monospace, Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0051d5; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.4;">
          This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">
          If you didn't create an account with DEVMEET, you can safely ignore this email.
        </p>
      </div>
    `,
  });
  console.log(`[Email] OTP sent to ${to} (MessageId: ${info.messageId})`);
  return info;
}

export default sendOtpEmail;
