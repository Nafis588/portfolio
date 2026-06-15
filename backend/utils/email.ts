import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import { fallbackProfile } from './fallback.js';

interface SendEmailOptions {
  to?: string;
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
  rawMessage?: string;
}

export async function sendEmail({ to, subject, html, fromName, fromEmail, rawMessage }: SendEmailOptions): Promise<boolean> {
  const isDbConnected = mongoose.connection.readyState === 1;
  let dbProfile;
  try {
    if (isDbConnected) {
      dbProfile = await Profile.findOne({});
    } else {
      dbProfile = fallbackProfile.get();
    }
  } catch (err) {
    console.error('Failed to fetch profile settings for email sending:', err);
  }

  const host = dbProfile?.smtpHost || process.env.EMAIL_HOST;
  const port = dbProfile?.smtpPort || process.env.EMAIL_PORT;
  const user = dbProfile?.smtpUser || process.env.EMAIL_USER;
  const pass = dbProfile?.smtpPass || process.env.EMAIL_PASS;
  const from = dbProfile?.smtpFrom || process.env.EMAIL_FROM || '"Portfolio Notification" <no-reply@portfolio.local>';
  const defaultTo = to || dbProfile?.smtpTo || process.env.EMAIL_TO || 'mdnafissadiqueniloy@gmail.com';

  if (!host || !port || !user || !pass) {
    console.warn('SMTP settings are not fully configured. Using FormSubmit fallback...');
    try {
      const payload: any = {
        _subject: subject,
        _honey: '' // Anti-spam honeypot
      };

      if (fromName) payload.Name = fromName;
      if (fromEmail) payload.Email = fromEmail;
      
      if (rawMessage) {
        payload.Message = rawMessage;
      } else {
        // Strip HTML tags for clean text message fallback
        payload.Message = html
          .replace(/<style([\s\S]*?)<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const response = await fetch(`https://formsubmit.co/ajax/${defaultTo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`FormSubmit returned status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log('Email sent successfully via FormSubmit fallback:', resData);
      return true;
    } catch (fallbackError) {
      console.error('Failed to send email via FormSubmit fallback:', fallbackError);
      return false;
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: typeof port === 'string' ? parseInt(port, 10) : port,
      secure: (typeof port === 'string' ? parseInt(port, 10) : port) === 465, // true for 465, false for others
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from,
      to: defaultTo,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
