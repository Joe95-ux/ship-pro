import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Get single shipment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        service: true,
        trackingEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shipment);

  } catch (error) {
    console.error('Get shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Update shipment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      status,
      currentLocation,
      estimatedDelivery,
      actualDelivery,
      finalCost,
      paymentStatus,
      specialInstructions
    } = body;

    // Check if shipment exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existingShipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Update shipment
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(currentLocation && { currentLocation }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(actualDelivery && { actualDelivery: new Date(actualDelivery) }),
        ...(finalCost && { finalCost }),
        ...(paymentStatus && { paymentStatus }),
        ...(specialInstructions && { specialInstructions }),
        updatedAt: new Date(),
      },
      include: {
        service: true,
        trackingEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    // Create tracking event if status changed
    if (status && status !== existingShipment.status) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId: id,
          status: `Status updated to ${status}`,
          description: `Shipment status changed from ${existingShipment.status} to ${status}`,
          location: currentLocation,
          timestamp: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Shipment updated successfully',
      shipment: updatedShipment,
    });

  } catch (error) {
    console.error('Update shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Delete shipment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if shipment exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existingShipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Delete tracking events first (cascade delete)
    await prisma.trackingEvent.deleteMany({
      where: { shipmentId: id },
    });

    // Delete shipment
    await prisma.shipment.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Shipment deleted successfully',
    });

  } catch (error) {
    console.error('Delete shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
