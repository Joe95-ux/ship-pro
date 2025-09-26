"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WaybillGenerator } from "@/components/WaybillGenerator";

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
  shipmentType?: string;
  shipmentMode?: string;
  paymentMode?: string;
  specialInstructions?: string;
}

interface WaybillPageProps {
  params: Promise<{ id: string }>;
}

export default function WaybillPage({ params }: WaybillPageProps) {
  const { user, isLoaded } = useUser();
  const [shipment, setShipment] = useState<WaybillShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shipmentId, setShipmentId] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  // Await params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setShipmentId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const loadShipment = async () => {
      if (!shipmentId) return;
      
      try {
        // In a real app, you'd fetch from your API
        // For now, we'll use mock data
        setShipment({
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
          service: { name: "Express Delivery" },
          weight: 5.5,
          dimensions: { length: 30, width: 20, height: 15, unit: "cm" },
          description: "Electronics package",
          estimatedCost: 125.50,
          estimatedDelivery: new Date("2024-01-20"),
          createdAt: new Date("2024-01-15"),
          shipmentType: "GENERAL",
          shipmentMode: "LAND_SHIPPING",
          paymentMode: "CARD",
          specialInstructions: "Handle with care"
        });
      } catch (error) {
        console.error('Failed to load shipment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.publicMetadata.role === 'admin' && shipmentId) {
      loadShipment();
    }
  }, [shipmentId, user]);

  const formatAddress = (address: { street: string; city: string; state: string; postalCode: string; country: string }) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  const generateWaybillData = (shipment: WaybillShipment) => {
    return {
      trackingNumber: shipment.trackingNumber,
      pickupDate: new Date(shipment.createdAt).toISOString().split('T')[0],
      pickupTime: "09:00 am",
      deliveryDate: new Date(shipment.estimatedDelivery).toISOString().split('T')[0],
      origin: shipment.senderAddress.country,
      destination: shipment.receiverAddress.country,
      courier: "LOGISTICA FALCON",
      carrier: "Logistica Falcon",
      carrierReference: shipment.trackingNumber,
      departureTime: "14:00 pm",
      shipper: {
        name: shipment.senderName,
        address: formatAddress(shipment.senderAddress),
        phone: shipment.senderPhone,
        email: shipment.senderEmail
      },
      consignee: {
        name: shipment.receiverName,
        address: formatAddress(shipment.receiverAddress),
        phone: shipment.receiverPhone,
        email: shipment.receiverEmail
      },
      status: shipment.status,
      comment: shipment.specialInstructions || "Package ready for pickup",
      shipmentType: shipment.shipmentType?.replace('_', ' ') || 'GENERAL',
      packages: shipment.description,
      product: shipment.description,
      totalFreight: "01",
      quantity: "01",
      weight: `${shipment.weight} kg`,
      paymentMode: shipment.paymentMode?.replace('_', ' ') || 'CARD',
      mode: shipment.shipmentMode?.replace('_', ' ') || 'LAND_SHIPPING'
    };
  };

  const handleDownload = async () => {
    if (!shipment) return;
    
    try {
      setIsDownloading(true);
      
      // Create a new window for printing/downloading
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const waybillData = generateWaybillData(shipment);
        
        // Generate HTML content for the waybill
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Waybill - ${shipment.trackingNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                .waybill-copy {
                  border: 1px solid #ccc;
                  background: white;
                  padding: 20px;
                  margin-bottom: 20px;
                  page-break-inside: avoid;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 20px;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 20px;
                }
                .logo-section {
                  display: flex;
                  align-items: center;
                  gap: 15px;
                }
                .logo {
                  width: 60px;
                  height: 60px;
                  background: #2563eb;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 24px;
                }
                .company-info h1 {
                  color: #2563eb;
                  font-weight: bold;
                  font-size: 24px;
                  margin: 0 0 5px 0;
                }
                .company-info .subtitle {
                  color: #3b82f6;
                  font-size: 14px;
                  margin: 0 0 10px 0;
                }
                .company-info p {
                  font-size: 12px;
                  color: #666;
                  margin: 2px 0;
                }
                .barcode-section {
                  text-align: right;
                }
                .barcode {
                  border: 1px solid #000;
                  padding: 10px;
                  margin-bottom: 10px;
                  display: inline-block;
                }
                .barcode-pattern {
                  height: 40px;
                  background: repeating-linear-gradient(
                    to right,
                    #000 0px,
                    #000 2px,
                    transparent 2px,
                    transparent 4px
                  );
                  margin-bottom: 5px;
                }
                .barcode-text {
                  font-family: monospace;
                  font-size: 12px;
                  text-align: center;
                }
                .copy-type {
                  font-size: 14px;
                  font-weight: bold;
                  color: #666;
                }
                .section {
                  margin-bottom: 20px;
                }
                .section-title {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 10px;
                  color: #333;
                }
                .grid-3 {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 15px;
                  border: 1px solid #ccc;
                }
                .grid-item {
                  padding: 10px;
                }
                .grid-item .label {
                  font-size: 12px;
                  font-weight: bold;
                  color: #666;
                  margin-bottom: 5px;
                }
                .grid-item .value {
                  font-size: 14px;
                }
                .parties-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 15px;
                  margin-bottom: 20px;
                }
                .party-box {
                  border: 1px solid #ccc;
                  padding: 15px;
                }
                .party-title {
                  font-size: 12px;
                  font-weight: bold;
                  color: #666;
                  margin-bottom: 10px;
                }
                .party-name {
                  font-weight: bold;
                  font-size: 14px;
                  margin-bottom: 5px;
                }
                .party-detail {
                  font-size: 12px;
                  color: #666;
                  margin-bottom: 2px;
                }
                @media print {
                  body { margin: 0; }
                  .waybill-copy { page-break-after: always; }
                  .waybill-copy:last-child { page-break-after: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="waybill-copy">
                <div class="header">
                  <div class="logo-section">
                    <div class="logo">LF</div>
                    <div class="company-info">
                      <h1>LOGISTICA FALCON</h1>
                      <div class="subtitle">LOGISTICA</div>
                      <p>Fast and reliable global freight | Logistica Falcon</p>
                      <p>Fast, Secure & Reliable shipping</p>
                      <p>https://logisticafalcon.com</p>
                    </div>
                  </div>
                  <div class="barcode-section">
                    <div class="barcode">
                      <div class="barcode-pattern"></div>
                      <div class="barcode-text">${waybillData.trackingNumber}</div>
                    </div>
                    <div class="copy-type">Accounts Copy</div>
                  </div>
                </div>
                
                <div class="section">
                  <div class="grid-3">
                    <div class="grid-item">
                      <div class="label">Pickup Date/Time</div>
                      <div class="value">${waybillData.pickupDate} ${waybillData.pickupTime}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Delivery Date</div>
                      <div class="value">${waybillData.deliveryDate}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Origin</div>
                      <div class="value">${waybillData.origin}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Destination</div>
                      <div class="value">${waybillData.destination}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Courier</div>
                      <div class="value">${waybillData.courier}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Carrier</div>
                      <div class="value">${waybillData.carrier}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Carrier Reference No.</div>
                      <div class="value">${waybillData.carrierReference}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Departure Time</div>
                      <div class="value">${waybillData.departureTime}</div>
                    </div>
                  </div>
                </div>
                
                <div class="parties-grid">
                  <div class="party-box">
                    <div class="party-title">Shipper</div>
                    <div class="party-name">${waybillData.shipper.name}</div>
                    <div class="party-detail">${waybillData.shipper.address}</div>
                    <div class="party-detail">${waybillData.shipper.phone}</div>
                    <div class="party-detail">${waybillData.shipper.email}</div>
                  </div>
                  <div class="party-box">
                    <div class="party-title">Consignee</div>
                    <div class="party-name">${waybillData.consignee.name}</div>
                    <div class="party-detail">${waybillData.consignee.address}</div>
                    <div class="party-detail">${waybillData.consignee.phone}</div>
                    <div class="party-detail">${waybillData.consignee.email}</div>
                  </div>
                  <div class="party-box">
                    <div class="party-title">Status</div>
                    <div class="party-name">${waybillData.status}</div>
                    <div class="party-title" style="margin-top: 10px;">Comment</div>
                    <div class="party-detail">${waybillData.comment}</div>
                  </div>
                </div>
                
                <div class="section">
                  <div class="grid-3">
                    <div class="grid-item">
                      <div class="label">Type of Shipment</div>
                      <div class="value">${waybillData.shipmentType}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Packages</div>
                      <div class="value">${waybillData.packages}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Product</div>
                      <div class="value">${waybillData.product}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Total Freight</div>
                      <div class="value">${waybillData.totalFreight}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Quantity</div>
                      <div class="value">${waybillData.quantity}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Weight</div>
                      <div class="value">${waybillData.weight}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Payment Mode</div>
                      <div class="value">${waybillData.paymentMode}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Mode</div>
                      <div class="value">${waybillData.mode}</div>
                    </div>
                    <div class="grid-item">
                      <div class="label">Tracking</div>
                      <div class="value">${waybillData.trackingNumber}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="waybill-copy">
                <div class="header">
                  <div class="logo-section">
                    <div class="logo">LF</div>
                    <div class="company-info">
                      <h1>LOGISTICA FALCON</h1>
                      <div class="subtitle">LOGISTICA</div>
                      <p>Fast and reliable global freight | Logistica Falcon</p>
                      <p>Fast, Secure & Reliable shipping</p>
                      <p>https://logisticafalcon.com</p>
                    </div>
                  </div>
                  <div class="barcode-section">
                    <div class="barcode">
                      <div class="barcode-pattern"></div>
                      <div class="barcode-text">${waybillData.trackingNumber}</div>
                    </div>
                    <div class="copy-type">Consignee Copy</div>
                  </div>
                </div>
                <!-- Same content as above -->
              </div>
              
              <div class="waybill-copy">
                <div class="header">
                  <div class="logo-section">
                    <div class="logo">LF</div>
                    <div class="company-info">
                      <h1>LOGISTICA FALCON</h1>
                      <div class="subtitle">LOGISTICA</div>
                      <p>Fast and reliable global freight | Logistica Falcon</p>
                      <p>Fast, Secure & Reliable shipping</p>
                      <p>https://logisticafalcon.com</p>
                    </div>
                  </div>
                  <div class="barcode-section">
                    <div class="barcode">
                      <div class="barcode-pattern"></div>
                      <div class="barcode-text">${waybillData.trackingNumber}</div>
                    </div>
                    <div class="copy-type">Shippers Copy</div>
                  </div>
                </div>
                <!-- Same content as above -->
              </div>
            </body>
          </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to download waybill:', error);
    } finally {
      setIsDownloading(false);
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
          </div>
        </div>

        {/* Waybill Content */}
        {shipment && <WaybillGenerator data={generateWaybillData(shipment)} />}
      </div>
    </div>
  );
}
