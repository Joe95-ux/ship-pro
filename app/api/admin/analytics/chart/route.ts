import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'daily';

    const now = new Date();
    let startDate: Date;
    let dataPoints: number;

    // Calculate start date and number of data points based on timeframe
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 days ago
        dataPoints = 10;
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - (8 * 7 * 24 * 60 * 60 * 1000)); // 8 weeks ago
        dataPoints = 8;
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months ago
        dataPoints = 6;
        break;
      default:
        startDate = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
        dataPoints = 10;
    }

    const chartData = [];

    for (let i = 0; i < dataPoints; i++) {
      let periodStart: Date;
      let periodEnd: Date;
      let dateLabel: string;

      if (timeframe === 'daily') {
        periodStart = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        periodEnd = new Date(periodStart.getTime() + (24 * 60 * 60 * 1000));
        dateLabel = periodStart.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      } else if (timeframe === 'weekly') {
        periodStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
        periodEnd = new Date(periodStart.getTime() + (7 * 24 * 60 * 60 * 1000));
        dateLabel = `Week ${i + 1}`;
      } else {
        periodStart = new Date(startDate.getTime() + (i * 30 * 24 * 60 * 60 * 1000));
        periodEnd = new Date(periodStart.getTime() + (30 * 24 * 60 * 60 * 1000));
        dateLabel = periodStart.toLocaleDateString('en-US', { month: 'short' });
      }

      // Get shipment count for this period
      const shipments = await db.shipment.count({
        where: {
          createdAt: {
            gte: periodStart,
            lt: periodEnd
          }
        }
      });

      // Get delivery count for this period
      const deliveries = await db.shipment.count({
        where: {
          status: 'DELIVERED',
          actualDelivery: {
            gte: periodStart,
            lt: periodEnd
          }
        }
      });

      chartData.push({
        date: dateLabel,
        shipments,
        deliveries
      });
    }

    return NextResponse.json(chartData, { status: 200 });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
