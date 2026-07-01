const nodemailer = require('nodemailer');

// Abstracted email service so it can be swapped out later (e.g., with Resend or SendGrid)
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to another provider or SMTP details
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Sends an email.
   * @param {Object} options - The email options.
   * @param {string} options.to - Recipient email.
   * @param {string} options.subject - Email subject.
   * @param {string} options.html - HTML body of the email.
   */
  async sendEmail({ to, subject, html }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('WARNING: Email credentials (EMAIL_USER, EMAIL_PASS) not set in .env. Email will not be sent.');
      return;
    }

    try {
      const mailOptions = {
        from: `VitaMend <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email could not be sent');
    }
  }

  /**
   * Sends a password reset email to the user.
   * @param {string} email - The user's email address.
   * @param {string} resetToken - The plain text reset token.
   */
  async sendPasswordResetEmail(email, resetToken) {
    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">VitaMend</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">You requested to reset your password for your VitaMend account. Please click the button below to choose a new password. This link will expire in 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If the button doesn't work, copy and paste the following link into your browser:</p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetUrl}</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'VitaMend - Password Reset Request',
      html,
    });
  }
}

const emailService = new EmailService();

module.exports = emailService;
