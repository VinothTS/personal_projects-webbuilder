import { NextRequest, NextResponse } from 'next/server';
import { getBusinessConfig } from '@/lib/config';
import { sendContactEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get business config for recipient email
    const config = await getBusinessConfig();
    const recipientEmail = config.contact.email;

    // Generate enquiry ID
    const enquiryId = `ENQ-${Date.now()}`;

    // Send email notification
    try {
      await sendContactEmail({
        name,
        email,
        phone: phone || '',
        subject,
        message,
        recipientEmail
      });
      console.log('✅ Contact email sent successfully to:', recipientEmail);
    } catch (emailError) {
      console.error('⚠️ Email sending failed (but saving enquiry):', emailError);
      // Continue even if email fails - we'll still save the enquiry
    }

    // Save to enquiries file
    const fs = require('fs');
    const path = require('path');
    const enquiriesPath = path.join(process.cwd(), 'data', 'enquiries.json');

    let enquiries = [];
    if (fs.existsSync(enquiriesPath)) {
      const data = fs.readFileSync(enquiriesPath, 'utf-8');
      enquiries = JSON.parse(data);
    }

    enquiries.push({
      id: enquiryId,
      timestamp: new Date().toISOString(),
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'new',
      recipientEmail
    });

    fs.writeFileSync(enquiriesPath, JSON.stringify(enquiries, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      enquiryId
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
