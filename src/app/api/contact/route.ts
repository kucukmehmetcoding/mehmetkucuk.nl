import {NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {name, email, subject, message} = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({error: 'All fields are required'}, {status: 400});
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({error: 'Invalid email format'}, {status: 400});
    }

    // Here you would typically:
    // 1. Send an email using a service like Resend, SendGrid, etc.
    // 2. Store the message in a database
    // 3. Send a notification to Slack/Discord

    // For now, we'll log the message and return success
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // Example: Send email with Resend (uncomment when configured)
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'noreply@mehmetkucuk.nl',
      to: 'info@mehmetkucuk.nl',
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    */

    return NextResponse.json({success: true, message: 'Message sent successfully'});
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({error: 'Failed to send message'}, {status: 500});
  }
}
