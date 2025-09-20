'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import EmailPreferences from '@/components/EmailPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Settings } from 'lucide-react';

export default function EmailPreferencesPage() {
  const { user, isLoaded } = useUser();

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Mail className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Preferences</h1>
          <p className="text-gray-600">Manage email notification settings</p>
        </div>
      </div>

      <div className="grid gap-6">
        <EmailPreferences />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              System-wide email configuration and testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">SMTP Configuration</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Make sure the following environment variables are set in your .env.local file:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 font-mono">
                  <li>• SMTP_HOST</li>
                  <li>• SMTP_PORT</li>
                  <li>• SMTP_USER</li>
                  <li>• SMTP_PASS</li>
                  <li>• SMTP_FROM_NAME</li>
                  <li>• SMTP_FROM_EMAIL</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Email Templates</h4>
                <p className="text-sm text-green-700">
                  The system includes professional email templates for all shipment status changes:
                </p>
                <ul className="text-sm text-green-700 space-y-1 mt-2">
                  <li>• Shipment Created</li>
                  <li>• Shipment Picked Up</li>
                  <li>• In Transit</li>
                  <li>• Out for Delivery</li>
                  <li>• Delivered</li>
                  <li>• Cancelled</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Notification Recipients</h4>
                <p className="text-sm text-yellow-700">
                  Email notifications are automatically sent to:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 mt-2">
                  <li>• Sender (shipment creator)</li>
                  <li>• Receiver (package recipient)</li>
                  <li>• Admin users (if admin notifications are enabled)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
