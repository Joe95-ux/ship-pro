import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // Simulate different types of notifications
    const notifications = {
      shipment_update: {
        id: `shipment-${Date.now()}`,
        title: `Shipment Update: #${data.trackingNumber || 'TRK123456789'}`,
        message: `Status updated to ${data.status || 'DELIVERED'}`,
        type: data.status === 'DELIVERED' ? 'success' : 'info',
        priority: data.status === 'DELIVERED' ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/admin/shipments/${data.shipmentId || 'demo-1'}`,
        actionLabel: 'View Details',
        metadata: {
          shipmentId: data.shipmentId || 'demo-1',
          trackingNumber: data.trackingNumber || 'TRK123456789',
          status: data.status || 'DELIVERED'
        }
      },
      maintenance_alert: {
        id: `maintenance-${Date.now()}`,
        title: `Maintenance Required: ${data.vehicleName || 'Truck Alpha'}`,
        message: `${data.maintenanceType || 'Oil Change'} maintenance is due for vehicle ${data.vehicleId || 'VH-001'}`,
        type: 'warning',
        priority: 'high',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/admin/vehicles/${data.vehicleId || 'VH-001'}`,
        actionLabel: 'View Vehicle',
        metadata: {
          vehicleId: data.vehicleId || 'VH-001',
          vehicleName: data.vehicleName || 'Truck Alpha',
          maintenanceType: data.maintenanceType || 'Oil Change'
        }
      },
      system_alert: {
        id: `system-${Date.now()}`,
        title: data.title || 'System Alert',
        message: data.message || 'A system event has occurred',
        type: data.alertType || 'info',
        priority: data.priority || 'medium',
        timestamp: new Date().toISOString(),
        read: false,
        metadata: data.metadata || {}
      }
    };

    const notification = notifications[type as keyof typeof notifications];
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send via WebSocket/SSE
    // 3. Send push notifications
    // 4. Send emails for urgent notifications

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification simulated successfully'
    });

  } catch (error) {
    console.error('Error simulating notification:', error);
    return NextResponse.json(
      { error: 'Failed to simulate notification' },
      { status: 500 }
    );
  }
}
