const nodemailer = require("nodemailer");

// Check if nodemailer is available
let transporter = null;

// Initialize transporter only if email credentials are provided
const initTransporter = () => {
  try {
    // For Gmail
    if (process.env.EMAIL_SERVICE === "gmail" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log("Email transporter initialized for Gmail");
      return true;
    }
    
    // For Outlook
    if (process.env.EMAIL_SERVICE === "outlook" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log("Email transporter initialized for Outlook");
      return true;
    }
    
    // For custom SMTP
    if (process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log("Email transporter initialized for Custom SMTP");
      return true;
    }
    
    console.log("Email credentials not configured. Using development mode (no emails sent)");
    return false;
  } catch (error) {
    console.error("Failed to initialize email transporter:", error.message);
    return false;
  }
};

// Initialize on module load
initTransporter();

// Send password reset email
exports.sendPasswordResetEmail = async (to, resetUrl, userName) => {
  try {
    // If no transporter, use development mode
    if (!transporter) {
      console.log(`[DEV MODE] Password reset email would be sent to: ${to}`);
      console.log(`[DEV MODE] Reset link: ${resetUrl}`);
      return { success: true, devMode: true, resetUrl };
    }
    
    const mailOptions = {
      from: `"FYP Portal" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Password Reset Request - FYP Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1a6b5e 0%, #0d4e45 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              border: 1px solid #e0e0e0;
              border-top: none;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1a6b5e 0%, #0d4e45 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>We received a request to reset the password for your FYP Portal account.</p>
            <p>Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="warning">
              <strong>This link will expire in 1 hour.</strong><br>
              If you didn't request this, please ignore this email.
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>
            <p>Best regards,<br><strong>FYP Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; 2024 FYP Portal. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

// Send password reset success confirmation
exports.sendPasswordResetSuccessEmail = async (to, userName) => {
  try {
    if (!transporter) {
      console.log(`[DEV MODE] Password success email would be sent to: ${to}`);
      return { success: true, devMode: true };
    }
    
    const mailOptions = {
      from: `"FYP Portal" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Password Changed Successfully - FYP Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Password Changed</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1a6b5e 0%, #0d4e45 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              border: 1px solid #e0e0e0;
              border-top: none;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Changed Successfully</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>Your FYP Portal password has been successfully changed.</p>
            <p>If you made this change, no further action is required.</p>
            <p><strong>If you did not change your password, please contact support immediately.</strong></p>
            <p>Best regards,<br><strong>FYP Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; 2024 FYP Portal. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Success email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Success email error:", error.message);
    return { success: false };
  }
};
module.exports = {}