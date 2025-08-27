import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Get all services
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const services = await db.service.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('Services from database:', services);
    
    // If no services exist in database, return mock services with proper ObjectIDs
    if (services.length === 0) {
      console.log('No services found in database, returning mock services');
      const mockServices = [
        {
          id: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectID
          name: "Express Delivery",
          description: "Fast delivery service",
          features: ["Same day pickup", "Priority handling", "Real-time tracking"],
          price: "$25.00",
          icon: "🚀",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "507f1f77bcf86cd799439012", // Valid MongoDB ObjectID
          name: "Standard Delivery",
          description: "Regular delivery service",
          features: ["Standard pickup", "Reliable delivery", "Tracking updates"],
          price: "$15.00",
          icon: "📦",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "507f1f77bcf86cd799439013", // Valid MongoDB ObjectID
          name: "International Shipping",
          description: "International delivery service",
          features: ["Global coverage", "Customs handling", "Multi-language support"],
          price: "$35.00",
          icon: "🌍",
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return NextResponse.json({
        data: mockServices,
      });
    }

    return NextResponse.json({
      data: services,
    });

  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new service
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
      name,
      description,
      features = [],
      price,
      icon,
      active = true
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create service
    const service = await db.service.create({
      data: {
        name,
        description,
        features,
        price,
        icon,
        active,
      },
    });

    return NextResponse.json(
      { 
        message: 'Service created successfully',
        service 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
