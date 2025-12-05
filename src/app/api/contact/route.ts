import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, message, locale } = data;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save lead to database
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        notes: message,
        source: 'contact_form',
        status: 'new',
      },
    });

    // Get admin email from settings
    let adminEmail = 'info@mehmetkucuk.nl'; // Default
    try {
      const settings = await prisma.settings.findFirst();
      if (settings?.smtpUser) {
        adminEmail = settings.smtpUser;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }

    // Prepare email content based on locale
    const emailSubject = locale === 'tr' 
      ? `Yeni İletişim Formu Mesajı - ${name}`
      : locale === 'nl'
      ? `Nieuw contactformulier bericht - ${name}`
      : `New Contact Form Message - ${name}`;

    const emailHtml = `
      <h2>${locale === 'tr' ? 'Yeni İletişim Formu Mesajı' : locale === 'nl' ? 'Nieuw contactformulier bericht' : 'New Contact Form Message'}</h2>
      <p><strong>${locale === 'tr' ? 'İsim' : locale === 'nl' ? 'Naam' : 'Name'}:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>${locale === 'tr' ? 'Telefon' : locale === 'nl' ? 'Telefoon' : 'Phone'}:</strong> ${phone}</p>` : ''}
      <p><strong>${locale === 'tr' ? 'Mesaj' : locale === 'nl' ? 'Bericht' : 'Message'}:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>${locale === 'tr' ? 'Bu mesaj mehmetkucuk.nl iletişim formundan gönderildi.' : locale === 'nl' ? 'Dit bericht is verzonden via het contactformulier van mehmetkucuk.nl.' : 'This message was sent from mehmetkucuk.nl contact form.'}</small></p>
    `;

    // Send email notification
    try {
      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, lead is already saved
    }

    // Send auto-reply to customer
    const autoReplySubject = locale === 'tr'
      ? 'Mesajınız Alındı - Mehmet Küçük'
      : locale === 'nl'
      ? 'Uw bericht is ontvangen - Mehmet Küçük'
      : 'Your Message Received - Mehmet Küçük';

    const autoReplyHtml = locale === 'tr'
      ? `
        <h2>Merhaba ${name},</h2>
        <p>Mesajınız için teşekkür ederim. En kısa sürede size geri dönüş yapacağım.</p>
        <p>İyi günler dilerim,<br>Mehmet Küçük</p>
      `
      : locale === 'nl'
      ? `
        <h2>Hallo ${name},</h2>
        <p>Bedankt voor uw bericht. Ik neem zo snel mogelijk contact met u op.</p>
        <p>Met vriendelijke groet,<br>Mehmet Küçük</p>
      `
      : `
        <h2>Hello ${name},</h2>
        <p>Thank you for your message. I will get back to you as soon as possible.</p>
        <p>Best regards,<br>Mehmet Küçük</p>
      `;

    try {
      await sendEmail({
        to: email,
        subject: autoReplySubject,
        html: autoReplyHtml,
      });
    } catch (autoReplyError) {
      console.error('Error sending auto-reply:', autoReplyError);
    }

    return NextResponse.json({
      success: true,
      message: locale === 'tr' 
        ? 'Mesajınız başarıyla gönderildi!' 
        : locale === 'nl'
        ? 'Uw bericht is succesvol verzonden!'
        : 'Message sent successfully!',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
