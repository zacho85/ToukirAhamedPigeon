import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor() {
    console.log('📧 MailService constructor called');
    console.log('SMTP_HOST from env:', process.env.SMTP_HOST);
    console.log('SMTP_PORT from env:', process.env.SMTP_PORT);
    console.log('SMTP_USER from env:', process.env.SMTP_USER);
    console.log('SMTP_FROM from env:', process.env.SMTP_FROM);
    console.log('SMTP_PASSWORD from env:', process.env.SMTP_PASSWORD ? '✅ EXISTS' : '❌ MISSING');
    console.log('SMTP_PASSWORD length:', process.env.SMTP_PASSWORD?.length || 0);
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendOtpEmail(to: string, otpCode: string, purpose: string = 'login') {
    const subject = purpose === 'login' ? '🔐 Login Verification Code' : '📧 Welcome to Kongossa Pay - Verify Your Email';
    const html = this.getOtpEmailTemplate(otpCode, purpose);
    const text = `Your OTP code is: ${otpCode}. It will expire in 10 minutes.`;
    
    return this.sendMail(to, subject, html, text);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const subject = '🔐 Reset Your Kongossa Pay Password';
    const html = this.getPasswordResetEmailTemplate(resetUrl);
    const text = `Click this link to reset your password: ${resetUrl}`;
    
    return this.sendMail(to, subject, html, text);
  }

  async sendEmailVerification(to: string, verificationLink: string) {
    const subject = '📧 Verify Your Email Address';
    const html = this.getEmailVerificationTemplate(verificationLink);
    const text = `Click here to verify your email: ${verificationLink}`;
    
    return this.sendMail(to, subject, html, text);
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = '🎉 Welcome to Kongossa Pay!';
    const html = this.getWelcomeEmailTemplate(name);
    const text = `Welcome to Kongossa Pay! Start managing your finances today.`;
    
    return this.sendMail(to, subject, html, text);
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    console.log('🔵🔵🔵 MAIL SERVICE sendMail CALLED 🔵🔵🔵');
    console.log('=== MAIL SERVICE DEBUG ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    
    const fromEmail = process.env.SMTP_FROM?.trim() || 'info@kongossapay.com';
    const fromName = process.env.SMTP_FROM_NAME?.trim() || 'Kongossa Pay';
    
    console.log('Using fromEmail:', fromEmail);
    console.log('Using fromName:', fromName);
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,  // ✅ HTML version
      text: text || html.replace(/<[^>]*>/g, ''), // Plain text fallback
    };
    
    console.log('Mail options - HTML length:', html.length);
    
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      throw error;
    }
  }

  private getOtpEmailTemplate(otpCode: string, purpose: string): string {
    const title = purpose === 'login' ? 'Login Verification' : 'Email Verification';
    const message = purpose === 'login' 
      ? 'Use the verification code below to complete your login.' 
      : 'Welcome to Kongossa Pay! Use the code below to verify your email address.';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f7fb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 32px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .logo span {
            color: #ffd700;
          }
          .tagline {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
          }
          .content {
            padding: 32px 24px;
          }
          .otp-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 42px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 8px;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            font-family: monospace;
          }
          .message {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 24px;
            text-align: center;
          }
          .expiry {
            text-align: center;
            font-size: 12px;
            color: #a0aec0;
            margin-top: 20px;
          }
          .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">Kongossa<span>Pay</span></div>
              <div class="tagline">Secure Digital Payments</div>
            </div>
            <div class="content">
              <h2 style="text-align: center; color: #2d3748; margin-bottom: 16px;">${title}</h2>
              <p class="message">${message}</p>
              <div class="otp-code">${otpCode}</div>
              <p style="text-align: center; color: #4a5568; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="text-align: center; font-size: 12px; color: #a0aec0;">
                If you didn't request this, please ignore this email.
              </p>
              <div class="expiry">🔒 Secure & Encrypted</div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Kongossa Pay. All rights reserved.</p>
              <p>Secure Digital Payments Platform</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f7fb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 32px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .logo span {
            color: #ffd700;
          }
          .content {
            padding: 32px 24px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">Kongossa<span>Pay</span></div>
              <div class="tagline">Secure Digital Payments</div>
            </div>
            <div class="content">
              <h2 style="color: #2d3748; margin-bottom: 16px;">Reset Your Password</h2>
              <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset the password for your Kongossa Pay account. Click the button below to create a new password.
              </p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="font-size: 12px; color: #a0aec0; text-align: center; margin-top: 24px;">
                This password reset link will expire in <strong>1 hour</strong>.
              </p>
              <p style="font-size: 12px; color: #a0aec0; text-align: center;">
                If you didn't request this, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Kongossa Pay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailVerificationTemplate(verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f7fb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 32px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .logo span {
            color: #ffd700;
          }
          .content {
            padding: 32px 24px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">Kongossa<span>Pay</span></div>
              <div class="tagline">Secure Digital Payments</div>
            </div>
            <div class="content">
              <h2 style="color: #2d3748; margin-bottom: 16px;">Verify Your Email Address</h2>
              <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">
                Thanks for signing up! Please verify your email address to get started with Kongossa Pay.
              </p>
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email</a>
              </div>
              <p style="font-size: 12px; color: #a0aec0; text-align: center; margin-top: 24px;">
                This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Kongossa Pay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Kongossa Pay</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f7fb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 32px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .logo span {
            color: #ffd700;
          }
          .content {
            padding: 32px 24px;
          }
          .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">Kongossa<span>Pay</span></div>
              <div class="tagline">Secure Digital Payments</div>
            </div>
            <div class="content">
              <h2 style="color: #2d3748;">Welcome aboard, ${name}! 🎉</h2>
              <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">
                We're excited to have you on board. Kongossa Pay makes it easy to send money, make payments, and manage your finances securely.
              </p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px;">Go to Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Kongossa Pay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}