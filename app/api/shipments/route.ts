import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Get all shipments (with filtering and pagination)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const serviceId = searchParams.get('serviceId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
        { receiverName: { contains: search, mode: 'insensitive' } },
        { senderEmail: { contains: search, mode: 'insensitive' } },
        { receiverEmail: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (serviceId) {
      where.serviceId = serviceId;
    }

    // Get shipments with pagination
    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          service: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Shipments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Create new shipment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      senderName,
      senderEmail,
      senderPhone,
      senderAddress,
      receiverName,
      receiverEmail,
      receiverPhone,
      receiverAddress,
      serviceId,
      weight,
      dimensions,
      value,
      description,
      specialInstructions,
      estimatedCost,
      currency = 'USD',
      estimatedDelivery
    } = body;

    // Validate required fields
    if (!senderName || !senderEmail || !receiverName || !receiverEmail || !serviceId || !weight || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate tracking number
    const trackingNumber = `SP${Date.now().toString().slice(-9)}`;

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        status: 'PENDING',
        senderName,
        senderEmail,
        senderPhone,
        senderAddress,
        receiverName,
        receiverEmail,
        receiverPhone,
        receiverAddress,
        serviceId,
        weight,
        dimensions,
        value,
        description,
        specialInstructions,
        estimatedCost,
        currency,
        paymentStatus: 'PENDING',
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        createdBy: userId,
      },
      include: {
        service: true,
      },
    });

    // Create initial tracking event
    await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: 'Shipment created',
        description: 'Shipment has been created and is pending pickup',
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      { 
        message: 'Shipment created successfully',
        shipment 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
