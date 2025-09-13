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

// Operational Metrics
interface RouteData {
  route: string;
  shipments: number;
}

interface ShippingMethodData {
  method: string;
  avgDeliveryTime: number;
}

export async function getRouteData(dateFrom?: string, dateTo?: string): Promise<RouteData[]> {
  try {
    const where: Prisma.ShipmentWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get shipments with receiver information
    const shipments = await db.shipment.findMany({
      where,
      select: {
        receiverAddress: true
      }
    });
    
    // Group by city and country
    const routeMap = new Map<string, number>();
    
    shipments.forEach(shipment => {
      const route = `${shipment.receiverAddress.city}, ${shipment.receiverAddress.country}`;
      const existing = routeMap.get(route) || 0;
      routeMap.set(route, existing + 1);
    });
    
    // Convert to array and sort by count
    const routes = Array.from(routeMap.entries())
      .map(([route, shipments]) => ({ route, shipments }))
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 10);
    
    return routes;
  } catch (error) {
    console.error("Error fetching route data:", error);
    return [];
  }
}

export async function getShippingMethodData(dateFrom?: string, dateTo?: string): Promise<ShippingMethodData[]> {
  try {
    const where: Prisma.ShipmentWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get shipments with service information
    const shipments = await db.shipment.findMany({
      where,
      include: {
        service: {
          select: { name: true }
        }
      }
    });
    
    // Group by service type and calculate average delivery time
    const methodMap = new Map<string, { totalTime: number; count: number }>();
    
    shipments.forEach(shipment => {
      const serviceName = shipment.service.name.toLowerCase();
      let method = 'Land';
      
      if (serviceName.includes('air') || serviceName.includes('freight')) {
        method = 'Air';
      } else if (serviceName.includes('sea') || serviceName.includes('ocean')) {
        method = 'Sea';
      }
      
      // Mock delivery time calculation (in real app, this would be based on actual delivery data)
      const deliveryTime = method === 'Air' ? 2 + Math.random() * 3 : 
                          method === 'Sea' ? 7 + Math.random() * 14 : 
                          3 + Math.random() * 5;
      
      const existing = methodMap.get(method) || { totalTime: 0, count: 0 };
      methodMap.set(method, {
        totalTime: existing.totalTime + deliveryTime,
        count: existing.count + 1
      });
    });
    
    return Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      avgDeliveryTime: Math.round((data.totalTime / data.count) * 10) / 10
    }));
  } catch (error) {
    console.error("Error fetching shipping method data:", error);
    return [];
  }
}

// Financial Metrics
interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

interface CustomerSegmentData {
  segment: string;
  revenue: number;
}

export async function getMonthlyRevenueData(dateFrom?: string, dateTo?: string): Promise<MonthlyRevenueData[]> {
  try {
    const where: Prisma.ShipmentWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get shipments grouped by month
    const shipments = await db.shipment.findMany({
      where,
      select: {
        createdAt: true,
        estimatedCost: true
      }
    });
    
    // Group by month
    const monthMap = new Map<string, number>();
    
    shipments.forEach(shipment => {
      const month = shipment.createdAt.toLocaleDateString('en-US', { month: 'short' });
      const existing = monthMap.get(month) || 0;
      monthMap.set(month, existing + (shipment.estimatedCost || 0));
    });
    
    // Convert to array and sort by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = Array.from(monthMap.entries()).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue)
    }));
    
    return data.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    return [];
  }
}

export async function getCustomerSegmentData(dateFrom?: string, dateTo?: string): Promise<CustomerSegmentData[]> {
  try {
    const where: Prisma.ShipmentWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get shipments with sender information
    const shipments = await db.shipment.findMany({
      where,
      select: {
        estimatedCost: true,
        senderName: true
      }
    });
    
    // Mock customer segmentation based on sender name patterns
    const segmentMap = new Map<string, number>();
    
    shipments.forEach(shipment => {
      const senderName = shipment.senderName.toLowerCase();
      let segment = 'Retail';
      
      if (senderName.includes('corp') || senderName.includes('inc') || senderName.includes('ltd')) {
        segment = 'Corporate';
      } else if (senderName.includes('wholesale') || senderName.includes('distributor')) {
        segment = 'Wholesale';
      }
      
      const existing = segmentMap.get(segment) || 0;
      segmentMap.set(segment, existing + (shipment.estimatedCost || 0));
    });
    
    return Array.from(segmentMap.entries()).map(([segment, revenue]) => ({
      segment,
      revenue: Math.round(revenue)
    }));
  } catch (error) {
    console.error("Error fetching customer segment data:", error);
    return [];
  }
}

// Performance Metrics
interface DriverPerformanceData {
  driver: string;
  onTimeDeliveries: number;
}

interface CargoTypeData {
  cargoType: string;
  successRate: number;
}

export async function getDriverPerformanceData(dateFrom?: string, dateTo?: string): Promise<DriverPerformanceData[]> {
  try {
    const where: Prisma.ShipmentWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Mock driver data (in real app, this would come from driver/fleet tables)
    const mockDrivers = [
      'Driver A', 'Driver B', 'Driver C', 'Driver D', 'Driver E'
    ];
    
    return mockDrivers.map(driver => ({
      driver,
      onTimeDeliveries: Math.round(85 + Math.random() * 15) // 85-100%
    }));
  } catch (error) {
    console.error("Error fetching driver performance data:", error);
    return [];
  }
}

export async function getCargoTypeData(dateFrom?: string, dateTo?: string): Promise<CargoTypeData[]> {
  try {
    const where: Prisma.ShipmentWhereInput = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get shipments with cargo type information
    const shipments = await db.shipment.findMany({
      where,
      select: {
        shipmentType: true,
        status: true
      }
    });
    
    // Group by cargo type and calculate success rate
    const typeMap = new Map<string, { delivered: number; total: number }>();
    
    shipments.forEach(shipment => {
      const type = shipment.shipmentType || 'Standard';
      const existing = typeMap.get(type) || { delivered: 0, total: 0 };
      
      if (shipment.status === 'DELIVERED') {
        existing.delivered++;
      }
      existing.total++;
      
      typeMap.set(type, existing);
    });
    
    return Array.from(typeMap.entries()).map(([cargoType, data]) => ({
      cargoType,
      successRate: Math.round((data.delivered / data.total) * 100)
    }));
  } catch (error) {
    console.error("Error fetching cargo type data:", error);
    return [];
  }
}