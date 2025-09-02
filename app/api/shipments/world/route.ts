import { NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { db } from '@/lib/db';
import { Address } from '@/lib/types';
import countries from 'i18n-iso-countries';
import { getCountryCoordinates, getFallbackCoordinates } from '@/lib/geocoding';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user || user.publicMetadata.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch shipments with Address typed correctly
    const shipments = await db.shipment.findMany({
      select: {
        id: true,
        senderAddress: true,
        receiverAddress: true,
        estimatedCost: true,
        createdAt: true
      }
    });

    // Calculate actual totals (not double-counted)
    const actualTotalShipments = shipments.length;
    const actualTotalRevenue = shipments.reduce((sum, shipment) => sum + (shipment.estimatedCost || 0), 0);

    // Create separate maps for sender and receiver countries
    const senderCountryMap = new Map<string, { count: number; revenue: number }>();
    const receiverCountryMap = new Map<string, { count: number; revenue: number }>();

    shipments.forEach(shipment => {
      const sender = shipment.senderAddress as Address | null;
      const receiver = shipment.receiverAddress as Address | null;

      // Count sender country
      if (sender?.country) {
        const existing = senderCountryMap.get(sender.country) || { count: 0, revenue: 0 };
        senderCountryMap.set(sender.country, {
          count: existing.count + 1,
          revenue: existing.revenue + (shipment.estimatedCost || 0)
        });
      }

      // Count receiver country
      if (receiver?.country) {
        const existing = receiverCountryMap.get(receiver.country) || { count: 0, revenue: 0 };
        receiverCountryMap.set(receiver.country, {
          count: existing.count + 1,
          revenue: existing.revenue + (shipment.estimatedCost || 0)
        });
      }
    });

    // Combine both maps for the breakdown
    const allCountries = new Set([
      ...senderCountryMap.keys(),
      ...receiverCountryMap.keys()
    ]);

    const countryData = Array.from(allCountries).map(country => {
      const senderData = senderCountryMap.get(country) || { count: 0, revenue: 0 };
      const receiverData = receiverCountryMap.get(country) || { count: 0, revenue: 0 };
      
      const countryCode = countries.getAlpha3Code(country, 'en') || '';
      
      return {
        country,
        countryCode,
        shipmentCount: senderData.count + receiverData.count, // Total involvement
        totalRevenue: senderData.revenue + receiverData.revenue, // Total involvement
        sentFrom: senderData.count,
        receivedIn: receiverData.count
      };
    })
    .filter((c) => c.countryCode !== '')
    .sort((a, b) => b.shipmentCount - a.shipmentCount);

    // Add coordinates for each country
    const countryDataWithCoordinates = await Promise.all(
      countryData.map(async (country) => {
        let coordinates = await getCountryCoordinates(country.country);
        
        // If Google API fails, use fallback coordinates
        if (!coordinates) {
          coordinates = getFallbackCoordinates(country.country);
        }
        
        // If still no coordinates, use a default location
        if (!coordinates) {
          coordinates = [0, 0]; // Default to center of map
        }
        
        return {
          ...country,
          coordinates
        };
      })
    );

    // Return data with correct totals
    const responseData = {
      totalShipments: actualTotalShipments,
      totalRevenue: actualTotalRevenue,
      countries: countryDataWithCoordinates
    };

    if (countryData.length === 0) {
      return NextResponse.json({
        totalShipments: 0,
        totalRevenue: 0,
        countries: [
          { 
            country: "United States", 
            countryCode: "USA", 
            shipmentCount: 45, 
            totalRevenue: 12500,
            sentFrom: 30,
            receivedIn: 15
          }
        ]
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching world shipment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch world shipment data' },
      { status: 500 }
    );
  }
}