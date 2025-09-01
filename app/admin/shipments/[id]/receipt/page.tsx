"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReceiptGenerator } from "@/components/ReceiptGenerator";

interface ReceiptShipment {
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
  finalCost: number;
  paymentStatus: string;
  paymentMode: string;
  estimatedDelivery: Date;
  createdAt: Date;
  shipmentType?: string;
}

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { user, isLoaded } = useUser();
  const [shipment, setShipment] = useState<ReceiptShipment | null>(null);
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
          finalCost: 125.50,
          paymentStatus: "PAID",
          paymentMode: "CARD",
          estimatedDelivery: new Date("2024-01-20"),
          createdAt: new Date("2024-01-15"),
          shipmentType: "GENERAL"
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

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  const generateReceiptData = (shipment: ReceiptShipment) => {
    return {
      trackingNumber: shipment.trackingNumber,
      shipper: {
        name: shipment.senderName,
        phone: shipment.senderPhone,
        address: formatAddress(shipment.senderAddress),
        email: shipment.senderEmail
      },
      receiver: {
        name: shipment.receiverName,
        phone: shipment.receiverPhone,
        address: formatAddress(shipment.receiverAddress),
        email: shipment.receiverEmail
      },
      packages: [{
        quantity: 1,
        pieceType: shipment.shipmentType?.replace('_', ' ') || 'Package',
        description: shipment.description,
        length: shipment.dimensions.length,
        width: shipment.dimensions.width,
        height: shipment.dimensions.height,
        weight: shipment.weight
      }]
    };
  };

  const handleDownload = async () => {
    if (!shipment) return;
    
    try {
      setIsDownloading(true);
      
      // Create a new window for printing/downloading
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const receiptData = generateReceiptData(shipment);
        
        // Calculate totals
        const totalVolumetricWeight = receiptData.packages.reduce((sum, pkg) => {
          const volume = (pkg.length * pkg.width * pkg.height) / 6000;
          return sum + volume;
        }, 0);

        const totalVolume = receiptData.packages.reduce((sum, pkg) => {
          const volume = (pkg.length * pkg.width * pkg.height) / 1000000;
          return sum + volume;
        }, 0);

        const totalActualWeight = receiptData.packages.reduce((sum, pkg) => sum + pkg.weight, 0);
        
        // Generate HTML content for the receipt
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${shipment.trackingNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                .receipt {
                  border: 1px solid #ccc;
                  background: white;
                  padding: 30px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 30px;
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
                  padding: 15px;
                  margin-bottom: 10px;
                  display: inline-block;
                }
                .barcode-pattern {
                  height: 50px;
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
                  font-size: 14px;
                  text-align: center;
                }
                .section {
                  margin-bottom: 25px;
                }
                .section-title {
                  font-weight: bold;
                  font-size: 18px;
                  margin-bottom: 15px;
                  color: #333;
                  text-transform: uppercase;
                }
                .parties-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 20px;
                  margin-bottom: 25px;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 20px;
                }
                .party-box {
                  border: 1px solid #ccc;
                  padding: 15px;
                }
                .party-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #666;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                }
                .party-name {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 5px;
                }
                .party-detail {
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 3px;
                }
                .package-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
                .package-table th {
                  background: #666;
                  color: white;
                  padding: 12px;
                  text-align: left;
                  font-size: 14px;
                  font-weight: bold;
                }
                .package-table td {
                  padding: 12px;
                  border-top: 1px solid #ccc;
                  font-size: 14px;
                }
                .summary-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 20px;
                  margin-top: 20px;
                }
                .summary-item {
                  text-align: center;
                }
                .summary-item:first-child {
                  text-align: left;
                }
                .summary-item:last-child {
                  text-align: right;
                }
                .summary-label {
                  font-size: 14px;
                  font-weight: bold;
                  color: #666;
                  margin-bottom: 5px;
                }
                .summary-value {
                  font-size: 16px;
                  font-weight: bold;
                  color: #333;
                }
                @media print {
                  body { margin: 0; }
                  .receipt { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
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
                      <div class="barcode-text">${receiptData.trackingNumber}</div>
                    </div>
                  </div>
                </div>
                
                <div class="parties-grid">
                  <div class="party-box">
                    <div class="party-title">Shipper Details:</div>
                    <div class="party-name">${receiptData.shipper.name}</div>
                    <div class="party-detail">${receiptData.shipper.phone}</div>
                    <div class="party-detail">${receiptData.shipper.address}</div>
                    <div class="party-detail">${receiptData.shipper.email}</div>
                  </div>
                  <div class="party-box">
                    <div class="party-title">Receiver Details:</div>
                    <div class="party-name">${receiptData.receiver.name}</div>
                    <div class="party-detail">${receiptData.receiver.phone}</div>
                    <div class="party-detail">${receiptData.receiver.address}</div>
                    <div class="party-detail">${receiptData.receiver.email}</div>
                  </div>
                </div>
                
                <div class="section">
                  <div class="section-title">Package Details:</div>
                  <table class="package-table">
                    <thead>
                      <tr>
                        <th>Qty.</th>
                        <th>Piece Type</th>
                        <th>Description</th>
                        <th>Length(cm)</th>
                        <th>Width(cm)</th>
                        <th>Height(cm)</th>
                        <th>Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${receiptData.packages.map(pkg => `
                        <tr>
                          <td>${pkg.quantity}</td>
                          <td>${pkg.pieceType}</td>
                          <td>${pkg.description}</td>
                          <td>${pkg.length}</td>
                          <td>${pkg.width}</td>
                          <td>${pkg.height}</td>
                          <td>${pkg.weight}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                
                <div class="summary-grid">
                  <div class="summary-item">
                    <div class="summary-label">Total Volumetric Weight : ${totalVolumetricWeight.toFixed(2)}kg.</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Total Volume : ${totalVolume.toFixed(2)}cu. m.</div>
                  </div>
                  <div class="summary-item">
                    <div class="summary-label">Total Actual Weight : ${totalActualWeight.toFixed(2)}kg.</div>
                  </div>
                </div>
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
      console.error('Failed to download receipt:', error);
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
          <p className="text-gray-600">Loading receipt...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Receipt</h1>
                <p className="text-gray-600">Tracking: {shipment?.trackingNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        {shipment && <ReceiptGenerator data={generateReceiptData(shipment)} />}
      </div>
    </div>
  );
}
