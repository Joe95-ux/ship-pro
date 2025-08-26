"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Clock, 
  Edit, 
  FileText, 
  Download,
  Printer,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import ReceiptGenerator from "@/components/ReceiptGenerator";
import WaybillGenerator from "@/components/WaybillGenerator";
import type { ShipmentWithDetails, ReceiptData, WaybillData } from "@/lib/types";

export default function ShipmentDetailsPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const shipmentId = params.id as string;
  
  const [shipment, setShipment] = useState<ShipmentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showWaybill, setShowWaybill] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (user?.publicMetadata.role === 'admin' && shipmentId) {
      loadShipmentDetails();
    }
  }, [user, shipmentId]);

  const loadShipmentDetails = async () => {
    try {
      setIsLoading(true);
      
      // Mock shipment data for demo
      const mockShipment: ShipmentWithDetails = {
        id: shipmentId,
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
        serviceId: "1",
        service: {
          id: "1",
          name: "Express Delivery",
          description: "Fast and reliable express delivery service",
          features: [],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        weight: 5.2,
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
          unit: "cm"
        },
        value: 150,
        description: "Electronics - Laptop computer",
        specialInstructions: "Handle with care - fragile electronics",
        estimatedCost: 45.99,
        finalCost: 45.99,
        currency: "USD",
        paymentStatus: "PAID",
        estimatedDelivery: new Date("2024-01-15T17:00:00Z"),
        actualDelivery: null,
        currentLocation: {
          name: "Chicago Distribution Center",
          address: {
            street: "789 Logistics Blvd",
            city: "Chicago",
            state: "IL",
            postalCode: "60601",
            country: "USA"
          },
          coordinates: {
            latitude: 41.8781,
            longitude: -87.6298
          }
        },
        route: [],
        trackingEvents: [
          {
            id: "1",
            shipmentId: shipmentId,
            status: "Package picked up",
            description: "Package has been picked up from sender",
            location: {
              name: "New York Facility",
              address: {
                street: "123 Shipping St",
                city: "New York",
                state: "NY",
                postalCode: "10001",
                country: "USA"
              },
              coordinates: {
                latitude: 40.7128,
                longitude: -74.0060
              }
            },
            timestamp: new Date("2024-01-12T09:00:00Z"),
            createdAt: new Date("2024-01-12T09:00:00Z")
          },
          {
            id: "2",
            shipmentId: shipmentId,
            status: "In transit",
            description: "Package is in transit to destination",
            location: {
              name: "Chicago Distribution Center",
              address: {
                street: "789 Logistics Blvd",
                city: "Chicago",
                state: "IL",
                postalCode: "60601",
                country: "USA"
              },
              coordinates: {
                latitude: 41.8781,
                longitude: -87.6298
              }
            },
            timestamp: new Date("2024-01-13T14:30:00Z"),
            createdAt: new Date("2024-01-13T14:30:00Z")
          }
        ],
        waybillGenerated: true,
        receiptGenerated: true,
        createdBy: user?.id || null,
        assignedDriver: null,
        createdAt: new Date("2024-01-12T08:00:00Z"),
        updatedAt: new Date("2024-01-13T14:30:00Z")
      };

      setShipment(mockShipment);
    } catch (error) {
      console.error('Failed to load shipment details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReceiptData = (shipment: ShipmentWithDetails): ReceiptData => {
    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      sender: {
        name: shipment.senderName,
        address: shipment.senderAddress
      },
      receiver: {
        name: shipment.receiverName,
        address: shipment.receiverAddress
      },
      service: shipment.service.name,
      weight: shipment.weight,
      dimensions: shipment.dimensions,
      cost: shipment.finalCost || shipment.estimatedCost,
      currency: shipment.currency,
      paymentStatus: shipment.paymentStatus,
      createdAt: shipment.createdAt
    };
  };

  const generateWaybillData = (shipment: ShipmentWithDetails): WaybillData => {
    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      barcodeData: shipment.trackingNumber,
      sender: {
        name: shipment.senderName,
        address: shipment.senderAddress,
        phone: shipment.senderPhone,
        email: shipment.senderEmail
      },
      receiver: {
        name: shipment.receiverName,
        address: shipment.receiverAddress,
        phone: shipment.receiverPhone,
        email: shipment.receiverEmail
      },
      service: {
        name: shipment.service.name,
        description: shipment.service.description
      },
      package: {
        weight: shipment.weight,
        dimensions: shipment.dimensions,
        description: shipment.description,
        value: shipment.value
      },
      shipping: {
        cost: shipment.finalCost || shipment.estimatedCost,
        currency: shipment.currency,
        estimatedDelivery: shipment.estimatedDelivery || new Date()
      },
      specialInstructions: shipment.specialInstructions,
      createdAt: shipment.createdAt
    };
  };

  const handlePrint = (type: 'receipt' | 'waybill') => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById(type);
      if (content) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${type === 'receipt' ? 'Shipping Receipt' : 'Waybill'} - ${shipment?.trackingNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .no-print { display: none !important; }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  if (!isLoaded || !user || user.publicMetadata.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested shipment could not be found.</p>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Shipment Details
              </h1>
              <p className="text-gray-600">Tracking Number: {shipment.trackingNumber}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(shipment.status)}>
                {shipment.status.replace('_', ' ')}
              </Badge>
              
              <div className="flex items-center space-x-2">
                {/* Receipt Button */}
                <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Receipt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Shipping Receipt</DialogTitle>
                    </DialogHeader>
                    <ReceiptGenerator 
                      data={generateReceiptData(shipment)}
                      onPrint={() => handlePrint('receipt')}
                    />
                  </DialogContent>
                </Dialog>

                {/* Waybill Button */}
                <Dialog open={showWaybill} onOpenChange={setShowWaybill}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Waybill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Shipping Waybill</DialogTitle>
                    </DialogHeader>
                    <WaybillGenerator 
                      data={generateWaybillData(shipment)}
                      onPrint={() => handlePrint('waybill')}
                    />
                  </DialogContent>
                </Dialog>
                
                <Link href={`/admin/shipments/${shipment.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sender & Receiver */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <span>Addresses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sender</h4>
                    <p className="font-medium">{shipment.senderName}</p>
                    <p className="text-sm text-gray-600">{formatAddress(shipment.senderAddress)}</p>
                    <p className="text-sm text-gray-500">{shipment.senderEmail} • {shipment.senderPhone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Receiver</h4>
                    <p className="font-medium">{shipment.receiverName}</p>
                    <p className="text-sm text-gray-600">{formatAddress(shipment.receiverAddress)}</p>
                    <p className="text-sm text-gray-500">{shipment.receiverEmail} • {shipment.receiverPhone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Package Information */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-red-600" />
                    <span>Package Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Service</p>
                      <p className="text-gray-900">{shipment.service.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weight</p>
                      <p className="text-gray-900">{shipment.weight} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dimensions</p>
                      <p className="text-gray-900">
                        {shipment.dimensions.length} x {shipment.dimensions.width} x {shipment.dimensions.height} {shipment.dimensions.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Value</p>
                      <p className="text-gray-900">{shipment.currency} {shipment.value?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-gray-900">{shipment.description}</p>
                  </div>
                  
                  {shipment.specialInstructions && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Special Instructions</p>
                      <p className="text-gray-900">{shipment.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <span>Shipping Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                      <p className="text-gray-900">{shipment.currency} {shipment.estimatedCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Final Cost</p>
                      <p className="text-gray-900">{shipment.currency} {(shipment.finalCost || shipment.estimatedCost).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Status</p>
                      <Badge className={shipment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {shipment.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created</p>
                      <p className="text-gray-900">{formatDate(shipment.createdAt)}</p>
                    </div>
                  </div>
                  
                  {shipment.estimatedDelivery && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                      <p className="text-gray-900">{formatDate(shipment.estimatedDelivery)}</p>
                    </div>
                  )}
                  
                  {shipment.actualDelivery && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Actual Delivery</p>
                      <p className="text-gray-900">{formatDate(shipment.actualDelivery)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Location */}
              {shipment.currentLocation && (
                <Card className="border-0 logistics-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <span>Current Location</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{shipment.currentLocation.name}</p>
                    <p className="text-sm text-gray-600">{formatAddress(shipment.currentLocation.address)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking">
            <Card className="border-0 logistics-shadow">
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.trackingEvents.map((event, index) => (
                    <div key={event.id} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        {index < shipment.trackingEvents.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{event.status}</h4>
                          <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            {event.location.name} - {formatAddress(event.location.address)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    <span>Shipping Receipt</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Official receipt for shipping payment and services
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowReceipt(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint('receipt')}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-red-600" />
                    <span>Waybill</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Official shipping document with tracking barcode
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWaybill(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint('waybill')}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
