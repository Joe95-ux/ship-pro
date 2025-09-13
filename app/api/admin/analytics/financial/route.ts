import { NextRequest, NextResponse } from "next/server";
import { getMonthlyRevenueData, getCustomerSegmentData } from "@/lib/dashboard-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type');

    let data;
    
    if (type === 'monthly') {
      data = await getMonthlyRevenueData(dateFrom || undefined, dateTo || undefined);
    } else if (type === 'segments') {
      data = await getCustomerSegmentData(dateFrom || undefined, dateTo || undefined);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}
