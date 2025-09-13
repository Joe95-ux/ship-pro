import { NextRequest, NextResponse } from "next/server";
import { getDriverPerformanceData, getCargoTypeData } from "@/lib/dashboard-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type');

    let data;
    
    if (type === 'drivers') {
      data = await getDriverPerformanceData(dateFrom || undefined, dateTo || undefined);
    } else if (type === 'cargo') {
      data = await getCargoTypeData(dateFrom || undefined, dateTo || undefined);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
