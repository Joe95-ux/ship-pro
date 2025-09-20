# Email Notification System

This document describes the comprehensive email notification system implemented for ShipPro, which automatically sends email notifications to admins and clients when shipment statuses change.

## 🚀 Features

### ✅ Implemented Features

1. **SMTP Email Integration**
   - Configurable SMTP settings via environment variables
   - Support for Gmail, Outlook, and other SMTP providers
   - Secure authentication with app passwords

2. **Professional Email Templates**
   - Shipment Created
   - Shipment Picked Up
   - In Transit
   - Out for Delivery
   - Delivered
   - Cancelled
   - Responsive HTML and plain text versions

3. **Automatic Notifications**
   - Triggered on shipment creation
   - Triggered on every status change
   - Sent to sender, receiver, and admin users

4. **Email Preferences Management**
   - User-configurable notification preferences
   - Admin notification settings
   - Email address management

5. **Admin Dashboard Integration**
   - Email preferences page
   - Test email functionality
   - Configuration status display

## 📧 Email Templates

### Template Features
- **Professional Design**: DHL-inspired theme with red (#D40511) and yellow (#FFCC00) colors
- **Responsive Layout**: Works on desktop and mobile devices
- **Dynamic Content**: Personalized with shipment details
- **Call-to-Action Buttons**: Direct links to tracking and feedback pages
- **Brand Consistency**: Matches the ShipPro website design

### Template Variables
All templates support the following variables:
- `{recipientName}` - Name of the email recipient
- `{trackingNumber}` - Shipment tracking number
- `{serviceName}` - Shipping service name
- `{senderName}` - Sender's name
- `{senderCity}` - Sender's city
- `{senderCountry}` - Sender's country
- `{receiverName}` - Receiver's name
- `{receiverCity}` - Receiver's city
- `{receiverCountry}` - Receiver's country
- `{weight}` - Package weight
- `{estimatedCost}` - Estimated shipping cost
- `{currency}` - Currency code
- `{estimatedDelivery}` - Estimated delivery date
- `{trackingUrl}` - Direct link to tracking page
- `{feedbackUrl}` - Link to feedback form

## ⚙️ Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="ShipPro"
SMTP_FROM_EMAIL="noreply@ship-pro.com"
```

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

### Other SMTP Providers

#### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
```

#### Yahoo Mail
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
```

#### Custom SMTP Server
```env
SMTP_HOST="your-smtp-server.com"
SMTP_PORT="587"  # or 465 for SSL
```

## 🗄️ Database Schema

### EmailPreferences Model

```prisma
model EmailPreferences {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  userId            String   @unique // Clerk user ID
  email             String   // User's email address
  
  // Notification preferences
  shipmentCreated   Boolean  @default(true)
  shipmentPickedUp  Boolean  @default(true)
  shipmentInTransit Boolean  @default(true)
  shipmentOutForDelivery Boolean @default(true)
  shipmentDelivered Boolean  @default(true)
  shipmentCancelled Boolean  @default(true)
  
  // Admin notifications
  adminNotifications Boolean @default(false) // Only for admin users
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("email_preferences")
}
```

## 🔧 API Endpoints

### Email Preferences
- `GET /api/email-preferences` - Get user's email preferences
- `POST /api/email-preferences` - Create/update email preferences
- `DELETE /api/email-preferences` - Delete email preferences

### Email Testing
- `GET /api/email/test` - Test SMTP configuration
- `POST /api/email/test` - Send test email

## 📱 User Interface

### Admin Email Preferences Page
- **Location**: `/admin/email-preferences`
- **Features**:
  - Email address configuration
  - Individual notification toggles
  - Admin notification settings
  - Test email functionality
  - Configuration status display

### Navigation Integration
- Added "Email" button to admin navigation
- Accessible from both desktop and mobile menus

## 🔄 Notification Flow

### Shipment Creation
1. Shipment is created via API
2. Initial tracking event is created
3. Email notifications are sent to:
   - Sender (shipment creator)
   - Receiver (package recipient)
   - Admin users (if admin notifications enabled)

### Status Updates
1. Shipment status is updated via API
2. New tracking event is created
3. Email notifications are sent to all recipients
4. Email preferences are respected (users can opt out)

### Error Handling
- Email failures don't affect shipment operations
- Errors are logged for debugging
- Graceful degradation if SMTP is unavailable

## 🧪 Testing

### Test Email Functionality
1. Navigate to `/admin/email-preferences`
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox for the test email

### SMTP Configuration Test
1. Make sure environment variables are set
2. Visit `/api/email/test` (GET request)
3. Check response for configuration status

### Manual Testing
1. Create a new shipment
2. Update shipment status
3. Verify emails are received
4. Check email preferences are respected

## 🚨 Troubleshooting

### Common Issues

#### "SMTP credentials not configured"
- Check that all SMTP environment variables are set
- Verify the values are correct
- Restart the development server after changes

#### "Authentication failed"
- For Gmail: Use App Password, not regular password
- Check 2-Factor Authentication is enabled
- Verify SMTP_USER is the correct email address

#### "Connection timeout"
- Check SMTP_HOST and SMTP_PORT are correct
- Verify firewall settings
- Try different SMTP providers

#### "Emails not being sent"
- Check server logs for error messages
- Verify email preferences are configured
- Test SMTP configuration first

### Debug Mode
Enable debug logging by adding to your environment:
```env
DEBUG_EMAIL=true
```

## 📊 Monitoring

### Email Delivery Tracking
- All email attempts are logged
- Success/failure rates can be monitored
- Failed emails don't affect shipment operations

### Performance Considerations
- Emails are sent asynchronously
- SMTP connection pooling for efficiency
- Graceful handling of SMTP timeouts

## 🔮 Future Enhancements

### Planned Features
- **Email Analytics**: Track open rates and click-through rates
- **Template Customization**: Allow admins to customize email templates
- **Bulk Email Management**: Send bulk notifications to multiple users
- **Email Scheduling**: Schedule emails for specific times
- **Advanced Preferences**: More granular notification controls

### Integration Opportunities
- **Webhook Support**: Send notifications to external systems
- **SMS Integration**: Add SMS notifications alongside email
- **Push Notifications**: Mobile app notifications
- **Slack Integration**: Admin notifications via Slack

## 📝 Usage Examples

### Sending Custom Email
```typescript
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email';

await sendEmail(
  'user@example.com',
  EMAIL_TEMPLATES.SHIPMENT_CREATED,
  {
    recipientName: 'John Doe',
    trackingNumber: 'SP123456789',
    // ... other variables
  }
);
```

### Checking Email Preferences
```typescript
const preferences = await db.emailPreferences.findUnique({
  where: { userId: 'user_123' }
});

if (preferences?.shipmentCreated) {
  // Send notification
}
```

## 🛡️ Security Considerations

- SMTP credentials are stored in environment variables
- App passwords are used instead of regular passwords
- Email content is sanitized to prevent injection
- Rate limiting prevents email spam
- User preferences are respected for privacy

## 📞 Support

For issues with the email system:
1. Check the troubleshooting section above
2. Verify SMTP configuration
3. Test with a simple email first
4. Check server logs for detailed error messages

---

This email notification system provides a robust, professional solution for keeping users informed about their shipments while maintaining flexibility and user control over their notification preferences.
