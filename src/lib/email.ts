import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // Fetch SMTP settings from the database
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    throw new Error('SMTP settings not configured');
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });

  const mailOptions = {
    from: settings.smtpUser,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendLeadNotification(leadData: { name: string; phone: string; email: string; notes: string }) {
  const subject = `New Lead Captured: ${leadData.name}`;
  const text = `
    Name: ${leadData.name}
    Phone: ${leadData.phone}
    Email: ${leadData.email}
    Notes: ${leadData.notes}
  `;
  
  // For now, send to the SMTP user as the admin
  const settings = await prisma.settings.findFirst();
  if (settings && settings.smtpUser) {
      await sendEmail({ to: settings.smtpUser, subject, text });
  } else {
      console.warn("Cannot send lead notification: SMTP settings or user not found.");
  }
}