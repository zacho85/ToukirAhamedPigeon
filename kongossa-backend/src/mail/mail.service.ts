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
  async sendMail(to: string, subject: string, text: string) {
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
      text,
    };
    console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
    
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      throw error;
    }
  }
}
