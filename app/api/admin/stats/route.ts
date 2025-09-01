import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current date for filtering recent data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get shipment statistics
    const [
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      cancelledShipments,
      revenueData,
      newContacts
    ] = await Promise.all([
      // Total shipments
      prisma.shipment.count(),
      
      // Pending shipments
      prisma.shipment.count({
        where: { status: 'PENDING' }
      }),
      
      // In transit shipments
      prisma.shipment.count({
        where: { 
          status: { 
            in: ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] 
          } 
        }
      }),
      
      // Delivered shipments
      prisma.shipment.count({
        where: { status: 'DELIVERED' }
      }),
      
      // Cancelled shipments
      prisma.shipment.count({
        where: { status: 'CANCELLED' }
      }),
      
      // Revenue calculation (sum of finalCost for delivered shipments)
      prisma.shipment.aggregate({
        where: {
          status: 'DELIVERED',
          finalCost: { not: null }
        },
        _sum: {
          finalCost: true
        }
      }),
      
      // New contact forms in last 30 days
      prisma.contactForm.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    // Calculate revenue from estimated costs if finalCost is not available
    const estimatedRevenueData = await prisma.shipment.aggregate({
      where: {
        status: 'DELIVERED',
        finalCost: null
      },
      _sum: {
        estimatedCost: true
      }
    });

    const finalRevenue = (revenueData._sum.finalCost || 0) + (estimatedRevenueData._sum.estimatedCost || 0);

    // Get shipment trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentShipments = await prisma.shipment.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true,
        status: true,
        estimatedCost: true,
        finalCost: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group shipments by date
    const shipmentsByDate: { [key: string]: number } = {};
    const revenueByDate: { [key: string]: number } = {};

    recentShipments.forEach(shipment => {
      const date = new Date(shipment.createdAt).toISOString().split('T')[0];
      shipmentsByDate[date] = (shipmentsByDate[date] || 0) + 1;
      
      const revenue = shipment.finalCost || shipment.estimatedCost;
      if (revenue) {
        revenueByDate[date] = (revenueByDate[date] || 0) + revenue;
      }
    });

    // Get top services
    const topServices = await prisma.service.findMany({
      include: {
        _count: {
          select: {
            shipments: true
          }
        }
      },
      orderBy: {
        shipments: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Get recent activity
    const recentActivity = await prisma.trackingEvent.findMany({
      include: {
        shipment: {
          select: {
            trackingNumber: true,
            senderName: true,
            receiverName: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });

    const stats = {
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      cancelledShipments,
      revenue: finalRevenue,
      newContacts,
      trends: {
        shipmentsByDate,
        revenueByDate
      },
      topServices: topServices.map(service => ({
        name: service.name,
        count: service._count.shipments,
        description: service.description
      })),
      recentActivity: recentActivity.map(event => ({
        id: event.id,
        status: event.status,
        description: event.description,
        timestamp: event.timestamp,
        trackingNumber: event.shipment.trackingNumber,
        senderName: event.shipment.senderName,
        receiverName: event.shipment.receiverName
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
