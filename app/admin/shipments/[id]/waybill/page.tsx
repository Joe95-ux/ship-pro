"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { db } from "@/lib/db";

interface WaybillShipment {
  id: string;
  trackingNumber: string;
  status: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  service: { name: string };
  weight: number;
  dimensions: { length: number; width: number; height: number; unit: string };
  description: string;
  estimatedCost: number;
  estimatedDelivery: Date;
  createdAt: Date;
}

export default function WaybillPage({ params }: { params: { id: string } }) {
  const { user, isLoaded } = useUser();
  const [shipment, setShipment] = useState<WaybillShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  useEffect(() => {
    const loadShipment = async () => {
      try {
        // In a real app, you'd fetch from your API
        // For now, we'll use mock data
        setShipment({
          id: params.id,
          trackingNumber: "SP123456789",
          status: "IN_TRANSIT",
          senderName: "John Doe",
          senderEmail: "john@example.com",
          senderPhone: "+1-555-0123",
          senderAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA"
          },
          receiverName: "Jane Smith",
          receiverEmail: "jane@example.com",
          receiverPhone: "+1-555-0456",
          receiverAddress: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            postalCode: "90210",
            country: "USA"
          },
          service: { name: "Express Delivery" },
          weight: 5.5,
          dimensions: { length: 30, width: 20, height: 15, unit: "cm" },
          description: "Electronics package",
          estimatedCost: 125.50,
          estimatedDelivery: new Date("2024-01-20"),
          createdAt: new Date("2024-01-15")
        });
      } catch (error) {
        console.error('Failed to load shipment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.publicMetadata.role === 'admin') {
      loadShipment();
    }
  }, [params.id, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, you'd generate a PDF
    console.log('Downloading waybill...');
  };

  if (!isLoaded || !user || user.publicMetadata.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading waybill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Waybill</h1>
                <p className="text-gray-600">Tracking: {shipment?.trackingNumber}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Waybill Content */}
        <Card className="print:shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">ShipPro Waybill</CardTitle>
                <p className="text-sm text-gray-600">International Shipping Document</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">ShipPro</div>
                <div className="text-sm text-gray-600">Est-Trans</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sender Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Sender Information</h3>
                <div className="space-y-2">
                  <p className="font-medium">{shipment?.senderName}</p>
                  <p className="text-sm text-gray-600">{shipment?.senderEmail}</p>
                  <p className="text-sm text-gray-600">{shipment?.senderPhone}</p>
                  <div className="text-sm text-gray-600">
                    <p>{shipment?.senderAddress?.street}</p>
                    <p>{shipment?.senderAddress?.city}, {shipment?.senderAddress?.state} {shipment?.senderAddress?.postalCode}</p>
                    <p>{shipment?.senderAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Receiver Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600">Receiver Information</h3>
                <div className="space-y-2">
                  <p className="font-medium">{shipment?.receiverName}</p>
                  <p className="text-sm text-gray-600">{shipment?.receiverEmail}</p>
                  <p className="text-sm text-gray-600">{shipment?.receiverPhone}</p>
                  <div className="text-sm text-gray-600">
                    <p>{shipment?.receiverAddress?.street}</p>
                    <p>{shipment?.receiverAddress?.city}, {shipment?.receiverAddress?.state} {shipment?.receiverAddress?.postalCode}</p>
                    <p>{shipment?.receiverAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Information */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Package Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{shipment?.service?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium">{shipment?.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dimensions</p>
                  <p className="font-medium">{shipment?.dimensions?.length} × {shipment?.dimensions?.width} × {shipment?.dimensions?.height} {shipment?.dimensions?.unit}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{shipment?.description}</p>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono font-medium text-lg">{shipment?.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="mt-1">{shipment?.status?.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-medium">{shipment?.estimatedDelivery?.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping Cost</p>
                  <p className="font-medium">${shipment?.estimatedCost?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Barcode Area */}
            <div className="mt-8 border-t pt-6">
              <div className="text-center">
                <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Barcode</p>
                  <div className="w-48 h-16 bg-gray-100 flex items-center justify-center">
                    <p className="text-xs text-gray-500">Barcode: {shipment?.trackingNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t pt-6 text-center text-sm text-gray-600">
              <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              <p>This document is valid for shipping purposes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
