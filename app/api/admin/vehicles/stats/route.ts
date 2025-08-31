import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, we'll return mock vehicle data since we don't have a vehicles table
    // In a real application, you would have a vehicles table with status tracking
    const mockVehicleStats = {
      totalVehicles: 89,
      activeVehicles: 67,
      onRouteVehicles: 45,
      maintenanceVehicles: 12,
      trend: 2.29
    };

    // If you have a vehicles table, you would query it like this:
    /*
    const [totalVehicles, activeVehicles, onRouteVehicles, maintenanceVehicles] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: 'ACTIVE' } }),
      db.vehicle.count({ where: { status: 'ON_ROUTE' } }),
      db.vehicle.count({ where: { status: 'MAINTENANCE' } })
    ]);

    // Calculate trend (compare with last week)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastWeekActive = await db.vehicle.count({
      where: { 
        status: 'ACTIVE',
        updatedAt: { gte: lastWeek }
      }
    });

    const trend = lastWeekActive > 0 ? ((activeVehicles - lastWeekActive) / lastWeekActive) * 100 : 0;

    const vehicleStats = {
      totalVehicles,
      activeVehicles,
      onRouteVehicles,
      maintenanceVehicles,
      trend: Math.round(trend * 100) / 100
    };
    */

    return NextResponse.json(mockVehicleStats, { status: 200 });

  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
