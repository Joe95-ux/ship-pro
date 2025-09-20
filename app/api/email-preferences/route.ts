import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Get user's email preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await db.emailPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        userId,
        email: '',
        shipmentCreated: true,
        shipmentPickedUp: true,
        shipmentInTransit: true,
        shipmentOutForDelivery: true,
        shipmentDelivered: true,
        shipmentCancelled: true,
        adminNotifications: false,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create or update user's email preferences
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
    const {
      email,
      shipmentCreated,
      shipmentPickedUp,
      shipmentInTransit,
      shipmentOutForDelivery,
      shipmentDelivered,
      shipmentCancelled,
      adminNotifications
    } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Upsert email preferences
    const preferences = await db.emailPreferences.upsert({
      where: { userId },
      update: {
        email,
        shipmentCreated: shipmentCreated ?? true,
        shipmentPickedUp: shipmentPickedUp ?? true,
        shipmentInTransit: shipmentInTransit ?? true,
        shipmentOutForDelivery: shipmentOutForDelivery ?? true,
        shipmentDelivered: shipmentDelivered ?? true,
        shipmentCancelled: shipmentCancelled ?? true,
        adminNotifications: adminNotifications ?? false,
        updatedAt: new Date(),
      },
      create: {
        userId,
        email,
        shipmentCreated: shipmentCreated ?? true,
        shipmentPickedUp: shipmentPickedUp ?? true,
        shipmentInTransit: shipmentInTransit ?? true,
        shipmentOutForDelivery: shipmentOutForDelivery ?? true,
        shipmentDelivered: shipmentDelivered ?? true,
        shipmentCancelled: shipmentCancelled ?? true,
        adminNotifications: adminNotifications ?? false,
      },
    });

    return NextResponse.json({
      message: 'Email preferences updated successfully',
      preferences,
    });
  } catch (error) {
    console.error('Update email preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user's email preferences
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await db.emailPreferences.delete({
      where: { userId },
    });

    return NextResponse.json({
      message: 'Email preferences deleted successfully',
    });
  } catch (error) {
    console.error('Delete email preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
