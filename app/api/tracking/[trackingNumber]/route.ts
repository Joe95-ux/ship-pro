import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Find shipment by tracking number
    const shipment = await prisma.shipment.findUnique({
      where: {
        trackingNumber: trackingNumber.toUpperCase(),
      },
      include: {
        service: true,
        trackingEvents: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Calculate progress based on status
    const getProgress = (status: string) => {
      switch (status) {
        case 'PENDING':
          return 0;
        case 'PICKED_UP':
          return 25;
        case 'IN_TRANSIT':
          return 50;
        case 'OUT_FOR_DELIVERY':
          return 75;
        case 'DELIVERED':
          return 100;
        default:
          return 0;
      }
    };

    const trackingData = {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      currentLocation: shipment.currentLocation,
      route: shipment.route,
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
      },
      weight: shipment.weight,
      dimensions: shipment.dimensions,
      estimatedCost: shipment.estimatedCost,
      finalCost: shipment.finalCost,
    };

    return NextResponse.json(trackingData, { status: 200 });

  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Update tracking information (for admin/system use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;
    const body = await request.json();
    
    const { status, location, description } = body;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Find shipment
    const shipment = await prisma.shipment.findUnique({
      where: {
        trackingNumber: trackingNumber.toUpperCase(),
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Update shipment status and location
    const updatedShipment = await prisma.shipment.update({
      where: {
        trackingNumber: trackingNumber.toUpperCase(),
      },
      data: {
        status: status || shipment.status,
        currentLocation: location || shipment.currentLocation,
        updatedAt: new Date(),
      },
    });

    // Add tracking event
    if (status || description) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: status || `Status updated`,
          description: description || `Shipment status updated to ${status}`,
          location: location,
          timestamp: new Date(),
        },
      });
    }

    return NextResponse.json(
      { 
        message: 'Tracking information updated successfully',
        shipment: updatedShipment 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Tracking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
