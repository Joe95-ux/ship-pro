import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

// Get email configuration from environment variables
function getEmailConfig(): EmailConfig {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'ShipPro',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@ship-pro.com',
  };

  if (!config.user || !config.pass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
  }

  return config;
}

// Create nodemailer transporter
function createTransporter() {
  const config = getEmailConfig();
  
  return nodemailer.createTransporter({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Shipment status email templates
export const EMAIL_TEMPLATES = {
  SHIPMENT_CREATED: {
    subject: 'Shipment Created - Tracking Number: {trackingNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D40511, #FFCC00); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">ShipPro</h1>
        </div>
        
        <h2 style="color: #D40511;">Shipment Created Successfully!</h2>
        
        <p>Dear {recipientName},</p>
        
        <p>Your shipment has been created and is now being processed. Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #D40511;">Shipment Details</h3>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Service:</strong> {serviceName}</p>
          <p><strong>From:</strong> {senderName} ({senderCity}, {senderCountry})</p>
          <p><strong>To:</strong> {receiverName} ({receiverCity}, {receiverCountry})</p>
          <p><strong>Weight:</strong> {weight} kg</p>
          <p><strong>Estimated Cost:</strong> {estimatedCost} {currency}</p>
          <p><strong>Estimated Delivery:</strong> {estimatedDelivery}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{trackingUrl}" style="background: #D40511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Shipment</a>
        </div>
        
        <p>You can track your shipment at any time using the tracking number above.</p>
        
        <p>Thank you for choosing ShipPro!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    `,
    text: `
      ShipPro - Shipment Created Successfully!
      
      Dear {recipientName},
      
      Your shipment has been created and is now being processed.
      
      Shipment Details:
      - Tracking Number: {trackingNumber}
      - Service: {serviceName}
      - From: {senderName} ({senderCity}, {senderCountry})
      - To: {receiverName} ({receiverCity}, {receiverCountry})
      - Weight: {weight} kg
      - Estimated Cost: {estimatedCost} {currency}
      - Estimated Delivery: {estimatedDelivery}
      
      Track your shipment: {trackingUrl}
      
      Thank you for choosing ShipPro!
    `
  },

  SHIPMENT_PICKED_UP: {
    subject: 'Shipment Picked Up - {trackingNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D40511, #FFCC00); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">ShipPro</h1>
        </div>
        
        <h2 style="color: #D40511;">Shipment Picked Up!</h2>
        
        <p>Dear {recipientName},</p>
        
        <p>Great news! Your shipment has been picked up and is now on its way.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #D40511;">Update Details</h3>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Status:</strong> Picked Up</p>
          <p><strong>Pickup Time:</strong> {pickupTime}</p>
          <p><strong>Location:</strong> {pickupLocation}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{trackingUrl}" style="background: #D40511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Shipment</a>
        </div>
        
        <p>Your shipment is now in transit. We'll keep you updated on its progress.</p>
        
        <p>Thank you for choosing ShipPro!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      ShipPro - Shipment Picked Up!
      
      Dear {recipientName},
      
      Great news! Your shipment has been picked up and is now on its way.
      
      Update Details:
      - Tracking Number: {trackingNumber}
      - Status: Picked Up
      - Pickup Time: {pickupTime}
      - Location: {pickupLocation}
      
      Track your shipment: {trackingUrl}
      
      Your shipment is now in transit. We'll keep you updated on its progress.
      
      Thank you for choosing ShipPro!
    `
  },

  SHIPMENT_IN_TRANSIT: {
    subject: 'Shipment In Transit - {trackingNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D40511, #FFCC00); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">ShipPro</h1>
        </div>
        
        <h2 style="color: #D40511;">Shipment In Transit</h2>
        
        <p>Dear {recipientName},</p>
        
        <p>Your shipment is making good progress and is currently in transit.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #D40511;">Current Status</h3>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Status:</strong> In Transit</p>
          <p><strong>Current Location:</strong> {currentLocation}</p>
          <p><strong>Last Update:</strong> {lastUpdate}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{trackingUrl}" style="background: #D40511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Shipment</a>
        </div>
        
        <p>We'll continue to monitor your shipment and provide updates as it progresses.</p>
        
        <p>Thank you for choosing ShipPro!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      ShipPro - Shipment In Transit
      
      Dear {recipientName},
      
      Your shipment is making good progress and is currently in transit.
      
      Current Status:
      - Tracking Number: {trackingNumber}
      - Status: In Transit
      - Current Location: {currentLocation}
      - Last Update: {lastUpdate}
      
      Track your shipment: {trackingUrl}
      
      We'll continue to monitor your shipment and provide updates as it progresses.
      
      Thank you for choosing ShipPro!
    `
  },

  SHIPMENT_OUT_FOR_DELIVERY: {
    subject: 'Shipment Out for Delivery - {trackingNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D40511, #FFCC00); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">ShipPro</h1>
        </div>
        
        <h2 style="color: #D40511;">Shipment Out for Delivery!</h2>
        
        <p>Dear {recipientName},</p>
        
        <p>Exciting news! Your shipment is out for delivery and should arrive soon.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #D40511;">Delivery Information</h3>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Status:</strong> Out for Delivery</p>
          <p><strong>Delivery Address:</strong> {deliveryAddress}</p>
          <p><strong>Expected Delivery:</strong> {expectedDelivery}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>Please ensure someone is available to receive the package.</strong></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{trackingUrl}" style="background: #D40511; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Shipment</a>
        </div>
        
        <p>Thank you for choosing ShipPro!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      ShipPro - Shipment Out for Delivery!
      
      Dear {recipientName},
      
      Exciting news! Your shipment is out for delivery and should arrive soon.
      
      Delivery Information:
      - Tracking Number: {trackingNumber}
      - Status: Out for Delivery
      - Delivery Address: {deliveryAddress}
      - Expected Delivery: {expectedDelivery}
      
      Please ensure someone is available to receive the package.
      
      Track your shipment: {trackingUrl}
      
      Thank you for choosing ShipPro!
    `
  },

  SHIPMENT_DELIVERED: {
    subject: 'Shipment Delivered - {trackingNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D40511, #FFCC00); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">ShipPro</h1>
        </div>
        
        <h2 style="color: #28a745;">Shipment Delivered Successfully!</h2>
        
        <p>Dear {recipientName},</p>
        
        <p>Great news! Your shipment has been delivered successfully.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #D40511;">Delivery Confirmation</h3>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Status:</strong> Delivered</p>
          <p><strong>Delivery Time:</strong> {deliveryTime}</p>
          <p><strong>Delivered To:</strong> {deliveredTo}</p>
          <p><strong>Delivery Address:</strong> {deliveryAddress}</p>
        </div>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">✅ Your shipment has been delivered successfully!</p>
        </div>
        
        <p>Thank you for choosing ShipPro for your shipping needs. We hope you're satisfied with our service!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{feedbackUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Leave Feedback</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      ShipPro - Shipment Delivered Successfully!
      
      Dear {recipientName},
      
      Great news! Your shipment has been delivered successfully.
      
      Delivery Confirmation:
      - Tracking Number: {trackingNumber}
      - Status: Delivered
      - Delivery Time: {deliveryTime}
      - Delivered To: {deliveredTo}
      - Delivery Address: {deliveryAddress}
      
      ✅ Your shipment has been delivered successfully!
      
      Thank you for choosing ShipPro for your shipping needs. We hope you're satisfied with our service!
      
      Leave feedback: {feedbackUrl}
    `
  },

  SHIPMENT_CANCELLED: {
    subject: 'Shipment Cancelled - {trackingNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D40511, #FFCC00); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">ShipPro</h1>
        </div>
        
        <h2 style="color: #dc3545;">Shipment Cancelled</h2>
        
        <p>Dear {recipientName},</p>
        
        <p>We regret to inform you that your shipment has been cancelled.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #D40511;">Cancellation Details</h3>
          <p><strong>Tracking Number:</strong> {trackingNumber}</p>
          <p><strong>Status:</strong> Cancelled</p>
          <p><strong>Cancellation Date:</strong> {cancellationDate}</p>
          <p><strong>Reason:</strong> {cancellationReason}</p>
        </div>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #721c24;">If you have any questions about this cancellation, please contact our support team.</p>
        </div>
        
        <p>If you need to create a new shipment, please visit our website or contact our support team.</p>
        
        <p>Thank you for choosing ShipPro!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      ShipPro - Shipment Cancelled
      
      Dear {recipientName},
      
      We regret to inform you that your shipment has been cancelled.
      
      Cancellation Details:
      - Tracking Number: {trackingNumber}
      - Status: Cancelled
      - Cancellation Date: {cancellationDate}
      - Reason: {cancellationReason}
      
      If you have any questions about this cancellation, please contact our support team.
      
      If you need to create a new shipment, please visit our website or contact our support team.
      
      Thank you for choosing ShipPro!
    `
  }
};

// Replace template variables with actual values
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  return result;
}

// Send email function
export async function sendEmail(
  to: string | string[],
  template: EmailTemplate,
  variables: Record<string, string> = {}
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const transporter = createTransporter();

    // Replace variables in template
    const subject = replaceTemplateVariables(template.subject, variables);
    const html = replaceTemplateVariables(template.html, variables);
    const text = replaceTemplateVariables(template.text, variables);

    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Send shipment status notification
export async function sendShipmentNotification(
  shipment: any,
  status: string,
  recipients: { email: string; name: string; type: 'sender' | 'receiver' | 'admin' }[]
): Promise<boolean> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingUrl = `${appUrl}/tracking?trackingNumber=${shipment.trackingNumber}`;
    const feedbackUrl = `${appUrl}/contact`;

    // Get the appropriate template based on status
    let template: EmailTemplate;
    let statusText = '';

    switch (status) {
      case 'PENDING':
        template = EMAIL_TEMPLATES.SHIPMENT_CREATED;
        statusText = 'created';
        break;
      case 'PICKED_UP':
        template = EMAIL_TEMPLATES.SHIPMENT_PICKED_UP;
        statusText = 'picked up';
        break;
      case 'IN_TRANSIT':
        template = EMAIL_TEMPLATES.SHIPMENT_IN_TRANSIT;
        statusText = 'in transit';
        break;
      case 'OUT_FOR_DELIVERY':
        template = EMAIL_TEMPLATES.SHIPMENT_OUT_FOR_DELIVERY;
        statusText = 'out for delivery';
        break;
      case 'DELIVERED':
        template = EMAIL_TEMPLATES.SHIPMENT_DELIVERED;
        statusText = 'delivered';
        break;
      case 'CANCELLED':
        template = EMAIL_TEMPLATES.SHIPMENT_CANCELLED;
        statusText = 'cancelled';
        break;
      default:
        console.log(`No email template found for status: ${status}`);
        return false;
    }

    // Prepare common variables
    const commonVariables = {
      trackingNumber: shipment.trackingNumber,
      serviceName: shipment.service?.name || 'Shipping Service',
      senderName: shipment.senderName,
      senderCity: shipment.senderAddress?.city || '',
      senderCountry: shipment.senderAddress?.country || '',
      receiverName: shipment.receiverName,
      receiverCity: shipment.receiverAddress?.city || '',
      receiverCountry: shipment.receiverAddress?.country || '',
      weight: shipment.weight?.toString() || '0',
      estimatedCost: shipment.estimatedCost?.toString() || '0',
      currency: shipment.currency || 'USD',
      estimatedDelivery: shipment.estimatedDelivery 
        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
        : 'TBD',
      trackingUrl,
      feedbackUrl,
      pickupTime: new Date().toLocaleString(),
      pickupLocation: shipment.senderAddress 
        ? `${shipment.senderAddress.city}, ${shipment.senderAddress.country}`
        : 'Pickup Location',
      currentLocation: shipment.currentLocation?.name || 'In Transit',
      lastUpdate: new Date().toLocaleString(),
      deliveryAddress: shipment.receiverAddress 
        ? `${shipment.receiverAddress.street}, ${shipment.receiverAddress.city}, ${shipment.receiverAddress.country}`
        : 'Delivery Address',
      expectedDelivery: shipment.estimatedDelivery 
        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
        : 'TBD',
      deliveryTime: new Date().toLocaleString(),
      deliveredTo: shipment.receiverName,
      cancellationDate: new Date().toLocaleDateString(),
      cancellationReason: 'Please contact support for details',
    };

    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient) => {
      const variables = {
        ...commonVariables,
        recipientName: recipient.name,
      };

      return sendEmail(recipient.email, template, variables);
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(Boolean).length;
    
    console.log(`Email notifications sent: ${successCount}/${recipients.length} for shipment ${shipment.trackingNumber} (${statusText})`);
    
    return successCount > 0;
  } catch (error) {
    console.error('Error sending shipment notification:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const transporter = createTransporter();
    
    // Verify connection configuration
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}
