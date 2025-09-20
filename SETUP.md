# ShipPro Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your-mongodb-connection-string"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# Google Maps API (optional - tracking page will work without it)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="ShipPro"
SMTP_FROM_EMAIL="noreply@ship-pro.com"
```

## Google Maps Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (if needed for address autocomplete)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env.local` file

## Database Setup

1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Get your connection string
3. Add it to the `DATABASE_URL` in your `.env.local` file
4. Run the Prisma commands:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Clerk Authentication Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your publishable and secret keys
4. Add them to your `.env.local` file
5. Configure user metadata for admin roles in Clerk dashboard

## Admin User Setup

To create an admin user:

1. Sign up through the application
2. In Clerk dashboard, go to Users
3. Find your user and edit the metadata
4. Add: `{"role": "admin"}`
5. Save the changes

## Running the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Features Included

### ✅ Completed Features

1. **Landing Page** - Hero section, services overview, Request Quote button
2. **About Us Page** - Company information and team
3. **Contact Us Page** - Contact form with API integration
4. **Services Page** - Detailed service offerings with pricing
5. **Tracking Page** - Real-time tracking with Google Maps integration
6. **Admin Dashboard** - Complete CRUD operations for shipments
7. **Receipt & Waybill Generation** - Professional shipping documents
8. **API Routes** - Complete backend for all operations
9. **TypeScript Interfaces** - Comprehensive type definitions
10. **Prisma Models** - Full database schema for shipping operations

### 🎨 Design Features

- DHL-like theme with red (#D40511) and yellow (#FFCC00) colors
- Professional logistics aesthetic
- Responsive design for all screen sizes
- shadcn/ui components throughout
- Custom utility classes for logistics theme

### 🚀 Technical Features

- Next.js 14 with App Router
- TypeScript for type safety
- Prisma with MongoDB
- Clerk authentication with role-based access
- Google Maps integration for tracking
- Real-time tracking visualization
- PDF-ready receipt and waybill generation
- Professional shipping documents

### 📱 Pages Included

1. **/** - Landing page
2. **/about** - About us
3. **/contact** - Contact form
4. **/services** - Service offerings
5. **/tracking** - Package tracking
6. **/admin** - Admin dashboard (admin only)
7. **/admin/shipments/new** - Create shipment (admin only)
8. **/admin/shipments/[id]** - View shipment details (admin only)
9. **/sign-in** - Authentication (Clerk)
10. **/sign-up** - Registration (Clerk)

### 🔗 API Endpoints

- **POST /api/contact** - Contact form submission
- **GET /api/tracking/[trackingNumber]** - Get tracking data
- **PATCH /api/tracking/[trackingNumber]** - Update tracking
- **GET /api/shipments** - List shipments (admin)
- **POST /api/shipments** - Create shipment (admin)
- **GET /api/shipments/[id]** - Get shipment details (admin)
- **PATCH /api/shipments/[id]** - Update shipment (admin)
- **DELETE /api/shipments/[id]** - Delete shipment (admin)
- **GET /api/admin/stats** - Dashboard statistics (admin)

## Demo Data

The application includes sample tracking data for testing:
- Try tracking number: `SP123456789` or `123456789`
- Sample shipments are displayed in the admin dashboard
- Contact form submissions are stored in the database

## Security Features

- Clerk authentication with role-based access control
- Admin-only routes protected by middleware
- API key restrictions for Google Maps
- Input validation and sanitization
- CORS protection

## Deployment

The application is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- DigitalOcean App Platform

Remember to set up your environment variables in your deployment platform's dashboard.
