import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to resolve logo asset path
const getLogoPath = () => {
  const possiblePaths = [
    path.resolve(__dirname, "../assets/devmeet_logo.png"),
    path.resolve(process.cwd(), "src/assets/devmeet_logo.png"),
    path.resolve(__dirname, "../../../frontend/public/assets/devmeet_logo.png"),
    path.resolve(process.cwd(), "../frontend/public/assets/devmeet_logo.png"),
  ];

  for (const candidate of possiblePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
};

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
  const logoPath = getLogoPath();

  const attachments = [];
  if (logoPath) {
    attachments.push({
      filename: "devmeet_logo.png",
      path: logoPath,
      cid: "devmeet_logo",
    });
  }

  const currentYear = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEVMEET Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04);">
          
          <!-- Top Accent Gradient Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #1877f2 0%, #3b82f6 50%, #6366f1 100%); font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>

          <!-- Card Content -->
          <tr>
            <td style="padding: 36px 32px 32px 32px;">
              
              <!-- Brand Header -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          ${
                            logoPath
                              ? `<img src="cid:devmeet_logo" alt="DEVMEET" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e2e8f0; object-fit: cover;" />`
                              : `<div style="width: 36px; height: 36px; border-radius: 50%; background-color: #0f172a; color: #ffffff; font-weight: 800; font-size: 18px; line-height: 36px; text-align: center;">D</div>`
                          }
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1;">DEVMEET</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #dbeafe; letter-spacing: 0.5px; text-transform: uppercase;">
                      Verification
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #f1f5f9; padding-bottom: 24px;"></td>
                </tr>
              </table>

              <!-- Headline & Subtext -->
              <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -0.3px;">
                Verify Your Email Address
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Welcome to DEVMEET! Please use the 6-digit verification code below to complete your registration:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 16px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px;">
                      Your Verification Code
                    </div>
                    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; line-height: 1; padding-left: 10px; margin: 4px 0;">
                      ${otp}
                    </div>
                    <div style="margin-top: 12px; font-size: 12px; color: #64748b; font-weight: 500;">
                      ⏱️ Valid for <strong style="color: #334155;">10 minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Callout Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="font-size: 12px; color: #475569; line-height: 1.5; margin: 0;">
                      <strong>Security Tip:</strong> Never share this code with anyone. DEVMEET team members will never ask you for your verification code or password.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Ignore Notice -->
              <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0 0 8px 0;">
                If you didn't create an account with DEVMEET, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer Section inside card -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 32px; text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0; font-weight: 500;">
                DEVMEET &bull; Collaborative Engineering &amp; Coding Platform
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                &copy; ${currentYear} DEVMEET Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `DEVMEET Verification Code: ${otp}\n\nWelcome to DEVMEET! Please use the following 6-digit code to complete your registration:\n\n${otp}\n\nThis code is valid for 10 minutes.\n\nNever share this code with anyone. If you didn't create an account with DEVMEET, you can safely ignore this email.`;

  const info = await transporter.sendMail({
    from: '"DEVMEET" <noreply@devmeet.com>',
    to,
    subject: `Your DEVMEET Verification Code: ${otp}`,
    text,
    html,
    attachments,
  });

  console.log(`[Email] OTP sent to ${to} (MessageId: ${info.messageId})`);
  return info;
}

export default sendOtpEmail;
