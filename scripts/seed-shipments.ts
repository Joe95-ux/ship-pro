import { db } from '../lib/db';

async function seedShipments(): Promise<void> {
  try {
    console.log('Starting shipment seeding...');

    // First, ensure we have services in the database
    const services = await db.service.findMany();
    if (services.length === 0) {
      console.log('No services found. Please run: npm run seed:services first');
      return;
    }

    console.log(`Found ${services.length} services in database`);

    // Delete existing shipments and tracking events
    console.log('Cleaning up existing data...');
    await db.trackingEvent.deleteMany({});
    await db.shipment.deleteMany({});
    console.log('✅ Existing data cleaned up');

    // Use the first three services for our shipments
    const [expressService, standardService, intlService] = services;

    const shipments = [
      {
        trackingNumber: "SP123456789",
        status: "IN_TRANSIT",
        senderName: "John Smith",
        senderEmail: "john.smith@email.com",
        senderPhone: "+1-555-0123",
        senderAddress: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "USA"
        },
        receiverName: "Sarah Johnson",
        receiverEmail: "sarah.johnson@email.com",
        receiverPhone: "+1-555-0456",
        receiverAddress: {
          street: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90210",
          country: "USA"
        },
        serviceId: expressService.id,
        weight: 5.2,
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
          unit: "cm"
        },
        value: 150.00,
        description: "Electronics - Laptop computer",
        specialInstructions: "Handle with care - fragile electronics",
        estimatedCost: 45.99,
        finalCost: 45.99,
        currency: "USD",
        paymentStatus: "PAID",
        estimatedDelivery: new Date("2024-01-15T17:00:00Z"),
      },
      {
        trackingNumber: "SP987654321",
        status: "DELIVERED",
        senderName: "Maria Garcia",
        senderEmail: "maria.garcia@email.com",
        senderPhone: "+1-555-0789",
        senderAddress: {
          street: "321 Pine Street",
          city: "Miami",
          state: "FL",
          postalCode: "33101",
          country: "USA"
        },
        receiverName: "David Wilson",
        receiverEmail: "david.wilson@email.com",
        receiverPhone: "+1-555-0321",
        receiverAddress: {
          street: "654 Elm Street",
          city: "Seattle",
          state: "WA",
          postalCode: "98101",
          country: "USA"
        },
        serviceId: standardService.id,
        weight: 2.8,
        dimensions: {
          length: 25,
          width: 18,
          height: 12,
          unit: "cm"
        },
        value: 75.00,
        description: "Books and documents",
        specialInstructions: "Keep dry",
        estimatedCost: 28.50,
        finalCost: 28.50,
        currency: "USD",
        paymentStatus: "PAID",
        estimatedDelivery: new Date("2024-01-10T14:00:00Z"),
        actualDelivery: new Date("2024-01-10T13:45:00Z"),
      },
      {
        trackingNumber: "SP555666777",
        status: "PENDING",
        senderName: "Lisa Chen",
        senderEmail: "lisa.chen@email.com",
        senderPhone: "+1-555-0555",
        senderAddress: {
          street: "789 Maple Drive",
          city: "Boston",
          state: "MA",
          postalCode: "02101",
          country: "USA"
        },
        receiverName: "Robert Brown",
        receiverEmail: "robert.brown@email.com",
        receiverPhone: "+1-555-0666",
        receiverAddress: {
          street: "147 Cedar Lane",
          city: "Denver",
          state: "CO",
          postalCode: "80201",
          country: "USA"
        },
        serviceId: expressService.id,
        weight: 8.5,
        dimensions: {
          length: 40,
          width: 30,
          height: 25,
          unit: "cm"
        },
        value: 300.00,
        description: "Home appliances - Coffee maker",
        specialInstructions: "Fragile - Handle with extreme care",
        estimatedCost: 65.00,
        finalCost: 65.00,
        currency: "USD",
        paymentStatus: "PENDING",
        estimatedDelivery: new Date("2024-01-18T16:00:00Z"),
      },
      {
        trackingNumber: "SP111222333",
        status: "OUT_FOR_DELIVERY",
        senderName: "Michael Davis",
        senderEmail: "michael.davis@email.com",
        senderPhone: "+1-555-0111",
        senderAddress: {
          street: "456 Birch Road",
          city: "Austin",
          state: "TX",
          postalCode: "73301",
          country: "USA"
        },
        receiverName: "Jennifer Lee",
        receiverEmail: "jennifer.lee@email.com",
        receiverPhone: "+1-555-0222",
        receiverAddress: {
          street: "258 Willow Way",
          city: "Phoenix",
          state: "AZ",
          postalCode: "85001",
          country: "USA"
        },
        serviceId: standardService.id,
        weight: 3.1,
        dimensions: {
          length: 28,
          width: 22,
          height: 18,
          unit: "cm"
        },
        value: 120.00,
        description: "Clothing and accessories",
        specialInstructions: "No special instructions",
        estimatedCost: 32.00,
        finalCost: 32.00,
        currency: "USD",
        paymentStatus: "PAID",
        estimatedDelivery: new Date("2024-01-12T15:00:00Z"),
      },
      {
        trackingNumber: "SP444555666",
        status: "PICKED_UP",
        senderName: "Amanda Taylor",
        senderEmail: "amanda.taylor@email.com",
        senderPhone: "+1-555-0444",
        senderAddress: {
          street: "369 Spruce Street",
          city: "Portland",
          state: "OR",
          postalCode: "97201",
          country: "USA"
        },
        receiverName: "Christopher Martinez",
        receiverEmail: "christopher.martinez@email.com",
        receiverPhone: "+1-555-0555",
        receiverAddress: {
          street: "741 Ash Avenue",
          city: "San Diego",
          state: "CA",
          postalCode: "92101",
          country: "USA"
        },
        serviceId: intlService?.id || expressService.id,
        weight: 12.0,
        dimensions: {
          length: 50,
          width: 35,
          height: 30,
          unit: "cm"
        },
        value: 500.00,
        description: "Art supplies and materials",
        specialInstructions: "Keep upright, temperature controlled",
        estimatedCost: 85.00,
        finalCost: 85.00,
        currency: "USD",
        paymentStatus: "PAID",
        estimatedDelivery: new Date("2024-01-20T17:00:00Z"),
      }
    ];

    // Create shipments
    for (let i = 0; i < shipments.length; i++) {
      const shipmentData = shipments[i];
      
      console.log(`Creating shipment ${i + 1}: ${shipmentData.trackingNumber}`);

      const shipment = await db.shipment.create({
        data: {
          trackingNumber: shipmentData.trackingNumber,
          status: shipmentData.status as any,
          senderName: shipmentData.senderName,
          senderEmail: shipmentData.senderEmail,
          senderPhone: shipmentData.senderPhone,
          senderAddress: shipmentData.senderAddress,
          receiverName: shipmentData.receiverName,
          receiverEmail: shipmentData.receiverEmail,
          receiverPhone: shipmentData.receiverPhone,
          receiverAddress: shipmentData.receiverAddress,
          serviceId: shipmentData.serviceId,
          weight: shipmentData.weight,
          dimensions: shipmentData.dimensions,
          value: shipmentData.value,
          description: shipmentData.description,
          specialInstructions: shipmentData.specialInstructions,
          estimatedCost: shipmentData.estimatedCost,
          finalCost: shipmentData.finalCost,
          currency: shipmentData.currency,
          paymentStatus: shipmentData.paymentStatus as any,
          estimatedDelivery: shipmentData.estimatedDelivery,
          actualDelivery: shipmentData.actualDelivery || null,
          createdBy: null,
        },
      });

      // Create basic tracking event
      await db.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: 'Shipment created',
          description: `Shipment ${shipment.trackingNumber} has been created`,
          timestamp: new Date(),
        },
      });

      console.log(`✅ Created shipment: ${shipmentData.trackingNumber}`);
    }

    console.log('🎉 Shipment seeding completed successfully!');
    console.log(`Created ${shipments.length} shipments with tracking events`);

  } catch (error) {
    console.error('❌ Error seeding shipments:', error);
  }
}

// Run the seeding
seedShipments();
