import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the most recent active shipment
    const shipment = await db.shipment.findFirst({
      where: {
        status: {
          in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP']
        }
      },
      include: {
        service: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!shipment) {
      return NextResponse.json({ error: 'No active shipments found' }, { status: 404 });
    }

    // Calculate progress based on status
    const getProgress = (status: string) => {
      switch (status) {
        case 'PENDING': return 0;
        case 'PICKED_UP': return 25;
        case 'IN_TRANSIT': return 50;
        case 'OUT_FOR_DELIVERY': return 75;
        case 'DELIVERED': return 100;
        default: return 0;
      }
    };

    const trackingData = {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      currentLocation: shipment.currentLocation,
      events: shipment.trackingEvents,
      progress: getProgress(shipment.status),
      sender: {
        name: shipment.senderName,
        address: shipment.senderAddress,
      },
      receiver: {
        name: shipment.receiverName,
        address: shipment.receiverAddress,
      },
      service: {
        name: shipment.service.name,
        description: shipment.service.description,
      }
    };

    return NextResponse.json(trackingData, { status: 200 });

  } catch (error) {
    console.error('Error fetching most recent shipment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
