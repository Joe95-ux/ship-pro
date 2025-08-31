"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DashboardStats, ShipmentListItem, PaginatedResponse} from "@/lib/types";
import { Prisma, ShipmentStatus} from "@prisma/client";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get shipment counts by status
    const [
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      totalRevenue
    ] = await Promise.all([
      db.shipment.count(),
      db.shipment.count({ where: { status: "PENDING" } }),
      db.shipment.count({ where: { status: "IN_TRANSIT" } }),
      db.shipment.count({ where: { status: "DELIVERED" } }),
      db.shipment.aggregate({
        _sum: { estimatedCost: true }
      })
    ]);

    // Get new contacts count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newContacts = await db.contactForm.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    return {
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      revenue: totalRevenue._sum.estimatedCost || 0,
      newContacts
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getShipments(params: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  service?: string;
}): Promise<PaginatedResponse<ShipmentListItem>> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const { page, limit, status, search, dateFrom, dateTo, service } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ShipmentWhereInput = {};
    
    if (status && status !== "all") {
      where.status = status as ShipmentStatus;
    }
    
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { senderName: { contains: search, mode: "insensitive" } },
        { receiverName: { contains: search, mode: "insensitive" } }
      ];
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }
    
    if (service && service !== "all") {
      where.serviceId = service;
    }

    // Get shipments with pagination
    const [shipments, total] = await Promise.all([
      db.shipment.findMany({
        where,
        include: {
          service: {
            select: { name: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      db.shipment.count({ where })
    ]);

    // Transform to ShipmentListItem format
    const shipmentList: ShipmentListItem[] = shipments.map(shipment => ({
      id: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      shipmentType: shipment.shipmentType,
      paymentMode: shipment.paymentMode,
      estimatedDelivery: shipment.estimatedDelivery,
      estimatedCost: shipment.estimatedCost,
      createdAt: shipment.createdAt,
      service: { name: shipment.service.name }
    }));

    return {
      data: shipmentList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching shipments:", error);
    throw new Error("Failed to fetch shipments");
  }
}

export async function deleteShipment(shipmentId: string): Promise<void> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db.shipment.delete({
      where: { id: shipmentId }
    });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    throw new Error("Failed to delete shipment");
  }
}

export async function bulkDeleteShipments(shipmentIds: string[]): Promise<void> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db.shipment.deleteMany({
      where: {
        id: { in: shipmentIds }
      }
    });
  } catch (error) {
    console.error("Error bulk deleting shipments:", error);
    throw new Error("Failed to delete shipments");
  }
}

export async function updateShipmentStatus(shipmentId: string, status: string): Promise<void> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db.shipment.update({
      where: { id: shipmentId },
      data: { status: status as ShipmentStatus }
    });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    throw new Error("Failed to update shipment status");
  }
}

export async function getServices(): Promise<Array<{ id: string; name: string }>> {
  try {
    const services = await db.service.findMany({
      select: { id: true, name: true },
      where: { active: true },
      orderBy: { name: "asc" }
    });
    
    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services");
  }
}

interface TrackingData {
  trackingNumber: string;
  status: string;
  estimatedDelivery: Date | null;
  currentLocation: unknown;
  events: Array<{
    id: string;
    status: string;
    description: string | null;
    timestamp: Date;
    location: unknown;
  }>;
  progress: number;
  sender: {
    name: string;
    address: unknown;
  };
  receiver: {
    name: string;
    address: unknown;
  };
  service: {
    name: string;
    description: string;
  };
}

export async function getMostRecentShipment(): Promise<TrackingData | null> {
  try {
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
      return null;
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

    return {
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
  } catch (error) {
    console.error("Error fetching most recent shipment:", error);
    return null;
  }
}

interface AnalyticsData {
  totalShipments: number;
  deliveredShipments: number;
  inTransitShipments: number;
  deliveryRate: number;
  revenue: number;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Get shipment statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalShipments, deliveredShipments, inTransitShipments, totalRevenue] = await Promise.all([
      db.shipment.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.shipment.count({
        where: { 
          status: 'DELIVERED',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      db.shipment.count({
        where: { 
          status: 'IN_TRANSIT',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      db.shipment.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { estimatedCost: true }
      })
    ]);

    // Calculate delivery rate
    const deliveryRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;

    return {
      totalShipments,
      deliveredShipments,
      inTransitShipments,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      revenue: totalRevenue._sum.estimatedCost || 0
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      totalShipments: 0,
      deliveredShipments: 0,
      inTransitShipments: 0,
      deliveryRate: 0,
      revenue: 0
    };
  }
}
