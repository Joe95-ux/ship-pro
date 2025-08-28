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

    // Check if status has changed to create a tracking event
    const statusChanged = body.status && body.status !== existingShipment.status;
    
    console.log('Update shipment debug:', {
      oldStatus: existingShipment.status,
      newStatus: body.status,
      statusChanged,
      bodyKeys: Object.keys(body)
    });
    
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

    // Create tracking event if status changed
    if (statusChanged) {
      const getStatusDescription = (status: string) => {
        switch (status) {
          case 'PENDING': return 'Shipment created and pending pickup';
          case 'PICKED_UP': return 'Package has been picked up from sender';
          case 'IN_TRANSIT': return 'Package is in transit to destination';
          case 'OUT_FOR_DELIVERY': return 'Package is out for delivery';
          case 'DELIVERED': return 'Package has been delivered successfully';
          case 'CANCELLED': return 'Shipment has been cancelled';
          default: return `Status updated to ${status}`;
        }
      };

      const getLocationForStatus = (status: string) => {
        const defaultLocations = {
          'PENDING': {
            name: 'Processing Center',
            address: {
              street: '123 Logistics Ave',
              city: 'New York',
              state: 'NY',
              postalCode: '10001',
              country: 'USA'
            },
            coordinates: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          },
          'PICKED_UP': {
            name: 'Origin Facility',
            address: {
              street: '456 Pickup St',
              city: 'New York',
              state: 'NY',
              postalCode: '10001',
              country: 'USA'
            },
            coordinates: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          },
          'IN_TRANSIT': {
            name: 'Distribution Center',
            address: {
              street: '789 Transit Blvd',
              city: 'Chicago',
              state: 'IL',
              postalCode: '60601',
              country: 'USA'
            },
            coordinates: {
              latitude: 41.8781,
              longitude: -87.6298
            }
          },
          'OUT_FOR_DELIVERY': {
            name: 'Local Delivery Hub',
            address: {
              street: '321 Delivery Way',
              city: 'Los Angeles',
              state: 'CA',
              postalCode: '90210',
              country: 'USA'
            },
            coordinates: {
              latitude: 34.0522,
              longitude: -118.2437
            }
          },
          'DELIVERED': {
            name: 'Delivery Address',
            address: {
              street: '999 Customer St',
              city: 'Los Angeles',
              state: 'CA',
              postalCode: '90210',
              country: 'USA'
            },
            coordinates: {
              latitude: 34.0522,
              longitude: -118.2437
            }
          }
        };
        
        return defaultLocations[status as keyof typeof defaultLocations] || defaultLocations.PENDING;
      };

      await db.trackingEvent.create({
        data: {
          shipmentId: existingShipment.id,
          status: body.status,
          description: getStatusDescription(body.status),
          location: updatedShipment.currentLocation || getLocationForStatus(body.status),
          timestamp: new Date(),
        },
      });

      // Fetch updated shipment with new tracking events
      const finalShipment = await db.shipment.findUnique({
        where: { id: existingShipment.id },
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
        shipment: finalShipment,
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