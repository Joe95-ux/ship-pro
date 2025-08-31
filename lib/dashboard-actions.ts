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

interface ChartData {
  date: string;
  shipments: number;
  deliveries: number;
}

interface RevenueData {
  service: string;
  revenue: number;
  percentage: number;
  color: string;
}

export async function getChartData(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<ChartData[]> {
  try {
    const data: ChartData[] = [];
    
    if (timeframe === 'daily') {
      // Get data for the last 10 days
      for (let i = 9; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const [shipments, deliveries] = await Promise.all([
          db.shipment.count({
            where: { createdAt: { gte: startOfDay, lte: endOfDay } }
          }),
          db.shipment.count({
            where: { 
              status: 'DELIVERED',
              createdAt: { gte: startOfDay, lte: endOfDay }
            }
          })
        ]);
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          shipments,
          deliveries
        });
      }
    } else if (timeframe === 'weekly') {
      // Get data for the last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const [shipments, deliveries] = await Promise.all([
          db.shipment.count({
            where: { createdAt: { gte: startOfWeek, lte: endOfWeek } }
          }),
          db.shipment.count({
            where: { 
              status: 'DELIVERED',
              createdAt: { gte: startOfWeek, lte: endOfWeek }
            }
          })
        ]);
        
        data.push({
          date: `Week ${4-i}`,
          shipments,
          deliveries
        });
      }
    } else {
      // Get data for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const [shipments, deliveries] = await Promise.all([
          db.shipment.count({
            where: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
          }),
          db.shipment.count({
            where: { 
              status: 'DELIVERED',
              createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
          })
        ]);
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          shipments,
          deliveries
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}

export async function getRevenueData(): Promise<RevenueData[]> {
  try {
    // Get revenue by service type for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueByService = await db.shipment.groupBy({
      by: ['serviceId'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { estimatedCost: true },
      _count: true
    });
    
    // Get service names
    const serviceIds = revenueByService.map(item => item.serviceId);
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true }
    });
    
    // Create service map
    const serviceMap = new Map(services.map(service => [service.id, service.name]));
    
    // Calculate total revenue
    const totalRevenue = revenueByService.reduce((sum, item) => sum + (item._sum.estimatedCost || 0), 0);
    
    // Define colors for services
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];
    
    const data: RevenueData[] = revenueByService.map((item, index) => {
      const revenue = item._sum.estimatedCost || 0;
      const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
      
      return {
        service: serviceMap.get(item.serviceId) || 'Unknown Service',
        revenue: Math.round(revenue),
        percentage: Math.round(percentage * 100) / 100,
        color: colors[index % colors.length]
      };
    });
    
    // Sort by revenue (highest first)
    return data.sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
}
