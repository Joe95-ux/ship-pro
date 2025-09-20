import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { testEmailConfiguration, sendEmail, EMAIL_TEMPLATES } from '@/lib/email';

// Test email configuration
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isValid = await testEmailConfiguration();
    
    return NextResponse.json({
      success: isValid,
      message: isValid ? 'Email configuration is valid' : 'Email configuration is invalid',
    });
  } catch (error) {
    console.error('Test email configuration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send test email
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, templateType = 'SHIPMENT_CREATED' } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Get the template
    const template = EMAIL_TEMPLATES[templateType as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid template type' },
        { status: 400 }
      );
    }

    // Test variables
    const testVariables = {
      recipientName: 'Test User',
      trackingNumber: 'SP123456789',
      serviceName: 'Express Shipping',
      senderName: 'John Doe',
      senderCity: 'New York',
      senderCountry: 'USA',
      receiverName: 'Jane Smith',
      receiverCity: 'Los Angeles',
      receiverCountry: 'USA',
      weight: '2.5',
      estimatedCost: '25.99',
      currency: 'USD',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tracking?trackingNumber=SP123456789`,
      feedbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contact`,
      pickupTime: new Date().toLocaleString(),
      pickupLocation: 'New York, USA',
      currentLocation: 'Chicago, USA',
      lastUpdate: new Date().toLocaleString(),
      deliveryAddress: '123 Main St, Los Angeles, USA',
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      deliveryTime: new Date().toLocaleString(),
      deliveredTo: 'Jane Smith',
      cancellationDate: new Date().toLocaleDateString(),
      cancellationReason: 'Customer request',
    };

    const success = await sendEmail(to, template, testVariables);
    
    return NextResponse.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
    });
  } catch (error) {
    console.error('Send test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
