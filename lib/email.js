// lib/email.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendEmail = async (options) => {
  const mailOptions = {
    from: `ThesisMaster <${process.env.EMAIL_FROM || 'noreply@thesismaster.com'}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  }
  
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new Error('Email could not be sent')
  }
}

export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937;">ThesisMaster</h1>
      </div>
      
      <h2 style="color: #1f2937;">Verify Your Email Address</h2>
      
      <p>Hello ${user.name},</p>
      
      <p>Thank you for signing up for ThesisMaster! Please click the button below to verify your email address:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
      
      <p>This link will expire in 24 hours.</p>
      
      <p>If you didn't create an account with ThesisMaster, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 14px;">
        Best regards,<br>
        The ThesisMaster Team
      </p>
    </div>
  `
  
  await sendEmail({
    to: user.email,
    subject: 'Verify your ThesisMaster account',
    html
  })
}

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937;">ThesisMaster</h1>
      </div>
      
      <h2 style="color: #1f2937;">Reset Your Password</h2>
      
      <p>Hello ${user.name},</p>
      
      <p>You recently requested to reset your password for your ThesisMaster account. Click the button below to reset it:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
      
      <p>This link will expire in 10 minutes.</p>
      
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 14px;">
        Best regards,<br>
        The ThesisMaster Team
      </p>
    </div>
  `
  
  await sendEmail({
    to: user.email,
    subject: 'Reset your ThesisMaster password',
    html
  })
}