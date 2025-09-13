import { NextRequest, NextResponse } from "next/server";
import { getRouteData, getShippingMethodData } from "@/lib/dashboard-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const type = searchParams.get('type');

    let data;
    
    if (type === 'routes') {
      data = await getRouteData(dateFrom || undefined, dateTo || undefined);
    } else if (type === 'methods') {
      data = await getShippingMethodData(dateFrom || undefined, dateTo || undefined);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching operational data:', error);
    return NextResponse.json({ error: 'Failed to fetch operational data' }, { status: 500 });
  }
}
