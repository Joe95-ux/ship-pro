import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma, ShipmentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, search, dateFrom, dateTo, service } = body;

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
      where.serviceType = service;
    }

    // Get all shipments for export
    const shipments = await db.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: true,
        trackingEvents: true,
      }
    });

    // Convert to CSV format
    const csvHeaders = [
      'Tracking Number',
      'Status',
      'Sender Name',
      'Sender Email',
      'Sender Phone',
      'Sender Address',
      'Receiver Name',
      'Receiver Email',
      'Receiver Phone',
      'Receiver Address',
      'Service Type',
      'Weight (kg)',
      'Dimensions',
      'Estimated Cost',
      'Final Cost',
      'Currency',
      'Payment Status',
      'Created Date',
      'Updated Date'
    ];

    const csvRows = shipments.map(shipment => [
      shipment.trackingNumber,
      shipment.status,
      shipment.senderName,
      shipment.senderEmail,
      shipment.senderPhone,
      `${shipment.senderAddress.street}, ${shipment.senderAddress.city}, ${shipment.senderAddress.state} ${shipment.senderAddress.postalCode}, ${shipment.senderAddress.country}`,
      shipment.receiverName,
      shipment.receiverEmail,
      shipment.receiverPhone,
      `${shipment.receiverAddress.street}, ${shipment.receiverAddress.city}, ${shipment.receiverAddress.state} ${shipment.receiverAddress.postalCode}, ${shipment.receiverAddress.country}`,
      shipment.service?.name || shipment.serviceId,
      shipment.weight,
      `${shipment.dimensions.length}x${shipment.dimensions.width}x${shipment.dimensions.height} ${shipment.dimensions.unit}`,
      shipment.estimatedCost,
      shipment.finalCost || '',
      shipment.currency,
      shipment.paymentStatus,
      shipment.createdAt.toISOString().split('T')[0],
      shipment.updatedAt.toISOString().split('T')[0]
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="shipments-export.csv"',
      },
    });

  } catch (error) {
    console.error("Error exporting shipments:", error);
    return NextResponse.json(
      { error: "Failed to export shipments" },
      { status: 500 }
    );
  }
}
