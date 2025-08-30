"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Clock, 
  Edit, 
  FileText, 
  Download,
  Printer,
  Eye,
  CheckCircle,
  Truck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import ReceiptGenerator from "@/components/ReceiptGenerator";
import WaybillGenerator from "@/components/WaybillGenerator";
import { toast } from "@/hooks/use-toast";
import type { ShipmentWithDetails, ReceiptData, WaybillData, Address, Dimensions, PaymentStatus } from "@/lib/types";

interface MockShipment {
  id: string;
  trackingNumber: string;
  status: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: Address;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: Address;
  serviceId: string;
  service: { name: string; description: string };
  shipmentType?: string;
  shipmentMode?: string;
  weight: number;
  dimensions: Dimensions;
  value: number;
  description: string;
  specialInstructions: string;
  estimatedCost: number;
  finalCost: number;
  currency: string;
  paymentStatus: string;
  paymentMode?: string;
  estimatedDelivery: Date;
  actualDelivery: Date | null;
  currentLocation: { name: string; address: Address };
  trackingEvents: Array<{ id: string; status: string; description: string; timestamp: Date; location?: { name: string; address: Address } }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function ShipmentDetailsPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const searchParams = useSearchParams();
  const shipmentId = params.id as string;
  
  const [shipment, setShipment] = useState<MockShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showWaybill, setShowWaybill] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  const loadShipmentDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/shipments/${shipmentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipment data');
      }
      
      const shipmentData = await response.json();
      setShipment(shipmentData.shipment);
      
    } catch (error) {
      console.error('Failed to load shipment details:', error);
      toast({
        title: "Error",
        description: "Failed to load shipment details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    if (user?.publicMetadata.role === 'admin' && shipmentId) {
      loadShipmentDetails();
    }
  }, [user, shipmentId, loadShipmentDetails]);

  // Reload data when returning from edit page (detected by URL parameter)
  useEffect(() => {
    const updated = searchParams.get('updated');
    if (updated) {
      loadShipmentDetails();
      // Clear the updated parameter to prevent repeated calls
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('updated');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, loadShipmentDetails]);

  // Reload data when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadShipmentDetails();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadShipmentDetails]);

  const generateReceiptData = (shipment: MockShipment): ReceiptData => {
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
      paymentStatus: shipment.paymentStatus as PaymentStatus,
      createdAt: shipment.createdAt
    };
  };

  const generateWaybillData = (shipment: MockShipment): WaybillData => {
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
    if (printWindow && shipment) {
      const content = document.getElementById(type);
      if (content) {
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type === 'receipt' ? 'Shipping Receipt' : 'Waybill'} - ${shipment.trackingNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                }
                .no-print { display: none !important; }
                @media print {
                  body { margin: 0; }
                .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${content.outerHTML}
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
        printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'shipment created and pending pickup':
        return <Clock className="h-4 w-4" />;
      case 'picked_up':
      case 'package has been picked up from sender':
        return <Package className="h-4 w-4" />;
      case 'in_transit':
      case 'package is in transit to destination':
        return <Truck className="h-4 w-4" />;
      case 'out_for_delivery':
      case 'package is out for delivery':
        return <MapPin className="h-4 w-4" />;
      case 'delivered':
      case 'package has been delivered successfully':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'shipment has been cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string, index: number) => {
    const isCompleted = index === 0; // Most recent event is completed
    const isDelivered = status.toLowerCase().includes('delivered');
    
    if (isCompleted || isDelivered) {
      return {
        dot: 'bg-green-500 border-2 border-green-500 shadow-lg shadow-green-200',
        icon: 'text-white',
        title: 'text-green-700',
        connector: 'bg-green-300'
      };
    } else {
      return {
        dot: 'bg-gray-300 border-2 border-gray-300',
        icon: 'text-gray-500',
        title: 'text-gray-700',
        connector: 'bg-gray-200'
      };
    }
  };

  const formatAddress = (address: { street: string; city: string; state: string; postalCode: string; country: string }) => {
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
              <Badge className={getStatusBadgeColor(shipment.status)}>
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
                  <DialogContent className="sm:max-w-5xl max-w-5xl max-h-[90vh] overflow-y-auto">
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
                  <DialogContent className="sm:max-w-5xl max-w-5xl max-h-[90vh] overflow-y-auto">
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
                      <p className="text-sm font-medium text-gray-600">Shipment Type</p>
                      <p className="text-gray-900">{shipment.shipmentType?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shipment Mode</p>
                      <p className="text-gray-900">{shipment.shipmentMode?.replace('_', ' ') || 'N/A'}</p>
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
                      <p className="text-sm font-medium text-gray-600">Payment Mode</p>
                      <p className="text-gray-900">{shipment.paymentMode?.replace('_', ' ') || 'N/A'}</p>
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
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Clock className="h-6 w-6 text-red-600" />
                  <span>Tracking History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {shipment.trackingEvents.map((event: { id: string; status: string; description: string; timestamp: Date; location?: { name: string; address: Address } }, index: number) => {
                    const colors = getStatusColor(event.status, index);
                    const isCompleted = index === 0;
                    const isDelivered = event.status.toLowerCase().includes('delivered');
                    
                    return (
                      <div 
                        key={event.id} 
                        className={`flex space-x-4 transition-all duration-500 ease-in-out transform ${
                          isCompleted || isDelivered ? 'animate-in slide-in-from-left-5' : 'opacity-70'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${colors.dot}`}>
                            {(isCompleted || isDelivered) && (
                              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></div>
                            )}
                            <div className={colors.icon}>
                              {getStatusIcon(event.status)}
                            </div>
                          </div>
                          {index < shipment.trackingEvents.length - 1 && (
                            <div className={`w-0.5 h-16 mt-3 transition-all duration-500 ${colors.connector}`}></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-lg font-semibold transition-colors duration-300 ${colors.title}`}>
                              {event.status}
                              {isDelivered && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-bounce">
                                  ✅ Delivered
                                </span>
                              )}
                            </h4>
                            <span className="text-sm text-gray-500 font-medium">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-base text-gray-600 mt-2 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>
                                {typeof event.location === 'string' 
                                  ? event.location 
                                  : `${event.location.name} - ${formatAddress(event.location.address)}`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
