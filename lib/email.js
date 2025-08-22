// lib/email.js 
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export async function sendVerificationEmail(email, token, name) {
  // CONSISTENT: Use email-verify path everywhere
  const verificationUrl = `${BASE_URL}/auth/email-verify?token=${token}`
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@thesismaster.com',
    to: email,
    subject: 'Verify Your ThesisMaster Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
          .logo { display: inline-flex; align-items: center; color: white; font-size: 24px; font-weight: bold; }
          .logo-icon { width: 32px; height: 32px; background: white; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: #3B82F6; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <div class="logo-icon">✓</div>
            ThesisMaster
          </div>
          <h1>Welcome to ThesisMaster!</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for signing up for ThesisMaster! We're excited to help you on your thesis journey.</p>
          <p>To get started and secure your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> You must verify your email before you can sign in to your account.
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3B82F6; background: #f8f9fa; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with ThesisMaster, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The ThesisMaster Team</p>
        </div>
        
        <div class="footer">
          <p>ThesisMaster - AI-Powered Thesis Success</p>
          <p>If you have any questions, contact us at support@thesismaster.com</p>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Verification email sent successfully to:', email)
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    throw new Error('Failed to send verification email: ' + error.message)
  }
}

export async function sendPasswordResetEmail(email, token, name) {
  // CONSISTENT: Use reset-password path
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@thesismaster.com',
    to: email,
    subject: 'Reset Your ThesisMaster Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
          .logo { display: inline-flex; align-items: center; color: white; font-size: 24px; font-weight: bold; }
          .logo-icon { width: 32px; height: 32px; background: white; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; color: #EF4444; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <div class="logo-icon">🔒</div>
            ThesisMaster
          </div>
          <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset the password for your ThesisMaster account.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
          </div>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #EF4444; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <p><strong>This reset link will expire in 1 hour for security purposes.</strong></p>
          
          <p>After clicking the link, you'll be able to create a new password for your account.</p>
          
          <p>Best regards,<br>The ThesisMaster Team</p>
        </div>
        
        <div class="footer">
          <p>ThesisMaster - AI-Powered Thesis Success</p>
          <p>If you have any questions, contact us at support@thesismaster.com</p>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent successfully to:', email)
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw new Error('Failed to send password reset email: ' + error.message)
  }
}