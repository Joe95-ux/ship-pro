'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Settings, TestTube } from 'lucide-react';

interface EmailPreferences {
  userId: string;
  email: string;
  shipmentCreated: boolean;
  shipmentPickedUp: boolean;
  shipmentInTransit: boolean;
  shipmentOutForDelivery: boolean;
  shipmentDelivered: boolean;
  shipmentCancelled: boolean;
  adminNotifications: boolean;
}

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    userId: '',
    email: '',
    shipmentCreated: true,
    shipmentPickedUp: true,
    shipmentInTransit: true,
    shipmentOutForDelivery: true,
    shipmentDelivered: true,
    shipmentCancelled: true,
    adminNotifications: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load preferences on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/email-preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load email preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences.email) {
      toast.error('Email address is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/email-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Email preferences saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save email preferences:', error);
      toast.error('Failed to save email preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const testEmail = async () => {
    if (!preferences.email) {
      toast.error('Email address is required');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: preferences.email,
          templateType: 'SHIPMENT_CREATED',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  const updatePreference = (key: keyof EmailPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preferences
          </CardTitle>
          <CardDescription>
            Manage your email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Manage your email notification preferences for shipment updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={preferences.email}
            onChange={(e) => updatePreference('email', e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        {/* Shipment Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipment Notifications</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shipmentCreated">Shipment Created</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new shipment is created
                </p>
              </div>
              <Switch
                id="shipmentCreated"
                checked={preferences.shipmentCreated}
                onCheckedChange={(checked) => updatePreference('shipmentCreated', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shipmentPickedUp">Shipment Picked Up</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your shipment is picked up
                </p>
              </div>
              <Switch
                id="shipmentPickedUp"
                checked={preferences.shipmentPickedUp}
                onCheckedChange={(checked) => updatePreference('shipmentPickedUp', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shipmentInTransit">In Transit</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your shipment is in transit
                </p>
              </div>
              <Switch
                id="shipmentInTransit"
                checked={preferences.shipmentInTransit}
                onCheckedChange={(checked) => updatePreference('shipmentInTransit', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shipmentOutForDelivery">Out for Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your shipment is out for delivery
                </p>
              </div>
              <Switch
                id="shipmentOutForDelivery"
                checked={preferences.shipmentOutForDelivery}
                onCheckedChange={(checked) => updatePreference('shipmentOutForDelivery', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shipmentDelivered">Delivered</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your shipment is delivered
                </p>
              </div>
              <Switch
                id="shipmentDelivered"
                checked={preferences.shipmentDelivered}
                onCheckedChange={(checked) => updatePreference('shipmentDelivered', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shipmentCancelled">Cancelled</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified if your shipment is cancelled
                </p>
              </div>
              <Switch
                id="shipmentCancelled"
                checked={preferences.shipmentCancelled}
                onCheckedChange={(checked) => updatePreference('shipmentCancelled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Admin Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Admin Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="adminNotifications">Admin Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about all shipment activities (Admin only)
              </p>
            </div>
            <Switch
              id="adminNotifications"
              checked={preferences.adminNotifications}
              onCheckedChange={(checked) => updatePreference('adminNotifications', checked)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={savePreferences} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testEmail} 
            disabled={isTesting || !preferences.email}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
