import { db } from '../lib/db';

interface ServiceData {
  name: string;
  description: string;
  features: string[];
  price: string;
  icon: string;
  active: boolean;
}

const services: ServiceData[] = [
  {
    name: "Express Delivery",
    description: "Fast and reliable express delivery service with priority handling",
    features: [
      "Same day pickup",
      "Priority handling",
      "Real-time tracking",
      "Guaranteed delivery time",
      "Signature confirmation"
    ],
    price: "$25.00",
    icon: "🚀",
    active: true
  },
  {
    name: "Standard Delivery",
    description: "Cost-effective standard delivery service for regular shipments",
    features: [
      "Standard pickup",
      "Reliable delivery",
      "Tracking updates",
      "3-5 business days",
      "Email notifications"
    ],
    price: "$15.00",
    icon: "📦",
    active: true
  },
  {
    name: "International Shipping",
    description: "Comprehensive international shipping with customs handling",
    features: [
      "Global coverage",
      "Customs handling",
      "Multi-language support",
      "Insurance included",
      "Document preparation"
    ],
    price: "$35.00",
    icon: "🌍",
    active: true
  }
];

async function seedServices(): Promise<void> {
  try {
    console.log('Starting services seeding...');

    // Check if services already exist
    const existingServices = await db.service.findMany();
    if (existingServices.length > 0) {
      console.log('Services already exist in database. Skipping seeding.');
      return;
    }

    // Create services
    for (const serviceData of services) {
      console.log(`Creating service: ${serviceData.name}`);

      const service = await db.service.create({
        data: {
          name: serviceData.name,
          description: serviceData.description,
          features: serviceData.features,
          price: serviceData.price,
          icon: serviceData.icon,
          active: serviceData.active,
        },
      });

      console.log(`✅ Created service: ${service.name} (ID: ${service.id})`);
    }

    console.log('🎉 Services seeding completed successfully!');
    console.log(`Created ${services.length} services`);

  } catch (error) {
    console.error('❌ Error seeding services:', error);
  }
}

// Run the seeding
seedServices();
