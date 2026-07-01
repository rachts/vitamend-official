const { Resend } = require('resend');

class EmailService {
  constructor() {
    // We will initialize the Resend client dynamically if the API key is present
    this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }

  /**
   * Sends an email using the Resend API.
   * @param {Object} options - The email options.
   * @param {string} options.to - Recipient email.
   * @param {string} options.subject - Email subject.
   * @param {string} options.html - HTML body of the email.
   */
  async sendEmail({ to, subject, html }) {
    if (!this.resend) {
      throw new Error('RESEND_API_KEY not set in backend/.env');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'VitaMend <onboarding@resend.dev>', // Resend test email
        to,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`Email sent via Resend: ${data.id}`);
      return data;
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Email could not be sent');
    }
  }

  /**
   * Checks if Resend API key is configured.
   */
  verifyConnection() {
    if (!this.resend) {
      console.warn('WARNING: RESEND_API_KEY is missing. Emails will fail to send.');
      return false;
    }
    console.log('Resend API is configured and ready to send emails.');
    return true;
  }

  /**
   * Sends a password reset email to the user.
   * @param {string} email - The user's email address.
   * @param {string} resetToken - The plain text reset token.
   */
  async sendPasswordResetEmail(email, resetToken) {
    if (!process.env.FRONTEND_URL && !process.env.NEXTAUTH_URL) {
      console.warn("WARNING: FRONTEND_URL or NEXTAUTH_URL is missing. Reset link might be incorrect.");
    }
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
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

