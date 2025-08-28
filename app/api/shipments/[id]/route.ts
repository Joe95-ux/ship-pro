import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Get shipment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    // Find shipment by ID or tracking number
    let shipment;
    
    // First try to find by ID (MongoDB ObjectID format - 24 characters hex)
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      shipment = await db.shipment.findUnique({
        where: { id },
        include: {
          service: true,
          trackingEvents: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });
    }
    
    // If not found by ID, try to find by tracking number
    if (!shipment) {
      shipment = await db.shipment.findUnique({
        where: { trackingNumber: id.toUpperCase() },
        include: {
          service: true,
          trackingEvents: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });
    }

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shipment,
    });

  } catch (error) {
    console.error('Get shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update shipment by ID (for admin use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    // Find shipment first by ID or tracking number
    let existingShipment;
    
    // First try to find by ID (MongoDB ObjectID format - 24 characters hex)
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      existingShipment = await db.shipment.findUnique({
        where: { id },
      });
    }
    
    // If not found by ID, try to find by tracking number
    if (!existingShipment) {
      existingShipment = await db.shipment.findUnique({
        where: { trackingNumber: id.toUpperCase() },
      });
    }

    if (!existingShipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Update shipment using the found shipment's actual ID
    const updatedShipment = await db.shipment.update({
      where: { id: existingShipment.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        service: true,
        trackingEvents: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

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
  }
}

// Delete shipment by ID (for admin use)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    // Find shipment first by ID or tracking number
    let existingShipment;
    
    // First try to find by ID (MongoDB ObjectID format - 24 characters hex)
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      existingShipment = await db.shipment.findUnique({
        where: { id },
      });
    }
    
    // If not found by ID, try to find by tracking number
    if (!existingShipment) {
      existingShipment = await db.shipment.findUnique({
        where: { trackingNumber: id.toUpperCase() },
      });
    }

    if (!existingShipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Delete tracking events first (foreign key constraint)
    await db.trackingEvent.deleteMany({
      where: { shipmentId: existingShipment.id },
    });

    // Delete shipment using the found shipment's actual ID
    const deletedShipment = await db.shipment.delete({
      where: { id: existingShipment.id },
    });

    return NextResponse.json({
      message: 'Shipment deleted successfully',
      shipment: deletedShipment,
    });

  } catch (error) {
    console.error('Delete shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}