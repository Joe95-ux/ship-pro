"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Download } from "lucide-react";

interface WaybillData {
  trackingNumber: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  origin: string;
  destination: string;
  courier: string;
  carrier: string;
  carrierReference: string;
  departureTime: string;
  shipper: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  consignee: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  status: string;
  comment: string;
  shipmentType: string;
  packages: string;
  product: string;
  totalFreight: string;
  quantity: string;
  weight: string;
  paymentMode: string;
  mode: string;
}

interface WaybillGeneratorProps {
  data: WaybillData;
  isModal?: boolean;
}

// Simple barcode generator component
const Barcode = ({ value }: { value: string }) => {
  // Generate a more realistic barcode pattern
  const generateBarcodePattern = (text: string) => {
    // Create a more realistic barcode pattern
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 1000;
    const pattern = [];
    
    // Generate alternating thick and thin bars
    for (let i = 0; i < 20; i++) {
      const isThick = (seed + i) % 3 === 0;
      pattern.push(isThick ? 'thick' : 'thin');
    }
    
    return pattern;
  };

  const pattern = generateBarcodePattern(value);

  return (
    <div className="border border-black p-2 mb-2">
      <div className="flex items-center justify-center h-8 mb-1">
        {pattern.map((barType, index) => (
          <div
            key={index}
            className={`h-full ${barType === 'thick' ? 'w-1 bg-black' : 'w-0.5 bg-black'} mx-px`}
          />
        ))}
      </div>
      <div className="text-xs font-mono text-center">{value}</div>
    </div>
  );
};

export function WaybillGenerator({ data, isModal }: WaybillGeneratorProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    
    if (isModal) {
      // For modal usage, generate HTML and open in new window
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Waybill - ${data.trackingNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .waybill-copy { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo { width: 60px; height: 60px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-size: 24px; font-weight: bold; }
            .company-info { margin-left: 15px; }
            .barcode { border: 1px solid #000; padding: 8px; margin-bottom: 8px; text-align: center; }
            .barcode-pattern { height: 32px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
            .barcode-bar { background: #000; margin: 0 1px; }
            .barcode-text { font-size: 12px; font-family: monospace; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .section { border: 1px solid #ccc; padding: 15px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .package-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; border: 1px solid #ccc; }
            .package-item { padding: 15px; }
            .package-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 5px; }
            @media print { 
              @page { margin: 0.5in; size: A4; }
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
              .print\\:hidden { display: none !important; }
              .print\\:mb-4 { margin-bottom: 1rem !important; }
              .print\\:break-inside-avoid { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="waybill-copy">
            <div class="header">
              <div style="display: flex; align-items: center;">
                <div class="logo">LF</div>
                <div class="company-info">
                  <div style="font-size: 24px; font-weight: bold;">LOGISTICA FALCON</div>
                  <div style="font-size: 14px;">LOGISTICA</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="barcode">
                  <div class="barcode-pattern">
                    ${Array.from({ length: 20 }, (_, i) => 
                      `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                    ).join('')}
                  </div>
                  <div class="barcode-text">${data.trackingNumber}</div>
                </div>
                <div style="font-weight: bold; margin-top: 10px;">Accounts Copy</div>
              </div>
            </div>
            
            <div class="grid">
              <div class="section">
                <div class="section-title">Shipment Logistics</div>
                <div>Pickup Date/Time: ${data.pickupDate} ${data.pickupTime}</div>
                <div>Delivery Date: ${data.deliveryDate}</div>
                <div>Destination: ${data.destination}</div>
                <div>Origin: ${data.origin}</div>
                <div>Courier: ${data.courier}</div>
                <div>Carrier: ${data.carrier}</div>
                <div>Carrier Reference No.: ${data.carrierReference}</div>
                <div>Departure Time: ${data.departureTime}</div>
              </div>
              <div class="section">
                <div class="section-title">Parties Involved</div>
                <div><strong>Shipper:</strong> ${data.shipper.name}</div>
                <div>${data.shipper.address}</div>
                <div>${data.shipper.phone}</div>
                <div>${data.shipper.email}</div>
                <br/>
                <div><strong>Consignee:</strong> ${data.consignee.name}</div>
                <div>${data.consignee.address}</div>
                <div>${data.consignee.phone}</div>
                <div>${data.consignee.email}</div>
                <br/>
                <div><strong>Status:</strong> ${data.status}</div>
                <div><strong>Comment:</strong> ${data.comment}</div>
              </div>
            </div>
            
            <div class="package-grid">
              <div class="package-item">
                <div class="package-label">Type of Shipment</div>
                <div>${data.shipmentType}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Packages</div>
                <div>${data.packages}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Product</div>
                <div>${data.product}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Total Freight</div>
                <div>${data.totalFreight}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Quantity</div>
                <div>${data.quantity}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Weight</div>
                <div>${data.weight}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Payment Mode</div>
                <div>${data.paymentMode}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Mode</div>
                <div>${data.mode}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Tracking</div>
                <div style="font-family: monospace;">${data.trackingNumber}</div>
              </div>
            </div>
          </div>
          
          <div class="waybill-copy">
            <div class="header">
              <div style="display: flex; align-items: center;">
                <div class="logo">LF</div>
                <div class="company-info">
                  <div style="font-size: 24px; font-weight: bold;">LOGISTICA FALCON</div>
                  <div style="font-size: 14px;">LOGISTICA</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="barcode">
                  <div class="barcode-pattern">
                    ${Array.from({ length: 20 }, (_, i) => 
                      `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                    ).join('')}
                  </div>
                  <div class="barcode-text">${data.trackingNumber}</div>
                </div>
                <div style="font-weight: bold; margin-top: 10px;">Consignee Copy</div>
              </div>
            </div>
            
            <div class="grid">
              <div class="section">
                <div class="section-title">Shipment Logistics</div>
                <div>Pickup Date/Time: ${data.pickupDate} ${data.pickupTime}</div>
                <div>Delivery Date: ${data.deliveryDate}</div>
                <div>Destination: ${data.destination}</div>
                <div>Origin: ${data.origin}</div>
                <div>Courier: ${data.courier}</div>
                <div>Carrier: ${data.carrier}</div>
                <div>Carrier Reference No.: ${data.carrierReference}</div>
                <div>Departure Time: ${data.departureTime}</div>
              </div>
              <div class="section">
                <div class="section-title">Parties Involved</div>
                <div><strong>Shipper:</strong> ${data.shipper.name}</div>
                <div>${data.shipper.address}</div>
                <div>${data.shipper.phone}</div>
                <div>${data.shipper.email}</div>
                <br/>
                <div><strong>Consignee:</strong> ${data.consignee.name}</div>
                <div>${data.consignee.address}</div>
                <div>${data.consignee.phone}</div>
                <div>${data.consignee.email}</div>
                <br/>
                <div><strong>Status:</strong> ${data.status}</div>
                <div><strong>Comment:</strong> ${data.comment}</div>
              </div>
            </div>
            
            <div class="package-grid">
              <div class="package-item">
                <div class="package-label">Type of Shipment</div>
                <div>${data.shipmentType}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Packages</div>
                <div>${data.packages}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Product</div>
                <div>${data.product}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Total Freight</div>
                <div>${data.totalFreight}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Quantity</div>
                <div>${data.quantity}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Weight</div>
                <div>${data.weight}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Payment Mode</div>
                <div>${data.paymentMode}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Mode</div>
                <div>${data.mode}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Tracking</div>
                <div style="font-family: monospace;">${data.trackingNumber}</div>
              </div>
            </div>
          </div>
          
          <div class="waybill-copy">
            <div class="header">
              <div style="display: flex; align-items: center;">
                <div class="logo">LF</div>
                <div class="company-info">
                  <div style="font-size: 24px; font-weight: bold;">LOGISTICA FALCON</div>
                  <div style="font-size: 14px;">LOGISTICA</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="barcode">
                  <div class="barcode-pattern">
                    ${Array.from({ length: 20 }, (_, i) => 
                      `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                    ).join('')}
                  </div>
                  <div class="barcode-text">${data.trackingNumber}</div>
                </div>
                <div style="font-weight: bold; margin-top: 10px;">Shippers Copy</div>
              </div>
            </div>
            
            <div class="grid">
              <div class="section">
                <div class="section-title">Shipment Logistics</div>
                <div>Pickup Date/Time: ${data.pickupDate} ${data.pickupTime}</div>
                <div>Delivery Date: ${data.deliveryDate}</div>
                <div>Destination: ${data.destination}</div>
                <div>Origin: ${data.origin}</div>
                <div>Courier: ${data.courier}</div>
                <div>Carrier: ${data.carrier}</div>
                <div>Carrier Reference No.: ${data.carrierReference}</div>
                <div>Departure Time: ${data.departureTime}</div>
              </div>
              <div class="section">
                <div class="section-title">Parties Involved</div>
                <div><strong>Shipper:</strong> ${data.shipper.name}</div>
                <div>${data.shipper.address}</div>
                <div>${data.shipper.phone}</div>
                <div>${data.shipper.email}</div>
                <br/>
                <div><strong>Consignee:</strong> ${data.consignee.name}</div>
                <div>${data.consignee.address}</div>
                <div>${data.consignee.phone}</div>
                <div>${data.consignee.email}</div>
                <br/>
                <div><strong>Status:</strong> ${data.status}</div>
                <div><strong>Comment:</strong> ${data.comment}</div>
              </div>
            </div>
            
            <div class="package-grid">
              <div class="package-item">
                <div class="package-label">Type of Shipment</div>
                <div>${data.shipmentType}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Packages</div>
                <div>${data.packages}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Product</div>
                <div>${data.product}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Total Freight</div>
                <div>${data.totalFreight}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Quantity</div>
                <div>${data.quantity}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Weight</div>
                <div>${data.weight}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Payment Mode</div>
                <div>${data.paymentMode}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Mode</div>
                <div>${data.mode}</div>
              </div>
              <div class="package-item">
                <div class="package-label">Tracking</div>
                <div style="font-family: monospace;">${data.trackingNumber}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } else {
      // For standalone usage, use regular window.print()
      window.print();
    }
    
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // Generate HTML content for download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Waybill - ${data.trackingNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .waybill-copy { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .logo { width: 60px; height: 60px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-center; color: white; font-size: 24px; font-weight: bold; }
          .company-info { margin-left: 15px; }
          .barcode { border: 1px solid #000; padding: 8px; margin-bottom: 8px; text-align: center; }
          .barcode-pattern { height: 32px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
          .barcode-bar { background: #000; margin: 0 1px; }
          .barcode-text { font-size: 12px; font-family: monospace; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .section { border: 1px solid #ccc; padding: 15px; }
          .section-title { font-weight: bold; margin-bottom: 10px; }
          .package-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; border: 1px solid #ccc; }
          .package-item { padding: 15px; }
          .package-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 5px; }
          @media print { @page { margin: 0.5in; size: A4; } }
        </style>
      </head>
      <body>
        <div class="waybill-copy">
          <div class="header">
            <div style="display: flex; align-items: center;">
              <div class="logo">LF</div>
              <div class="company-info">
                <div style="font-size: 24px; font-weight: bold;">LOGISTICA FALCON</div>
                <div style="font-size: 14px;">LOGISTICA</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="barcode">
                <div class="barcode-pattern">
                  ${Array.from({ length: 20 }, (_, i) => 
                    `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                  ).join('')}
                </div>
                <div class="barcode-text">${data.trackingNumber}</div>
              </div>
              <div style="font-weight: bold; margin-top: 10px;">Accounts Copy</div>
            </div>
          </div>
          
          <div class="grid">
            <div class="section">
              <div class="section-title">Shipment Logistics</div>
              <div>Pickup Date/Time: ${data.pickupDate} ${data.pickupTime}</div>
              <div>Delivery Date: ${data.deliveryDate}</div>
              <div>Destination: ${data.destination}</div>
              <div>Origin: ${data.origin}</div>
              <div>Courier: ${data.courier}</div>
              <div>Carrier: ${data.carrier}</div>
              <div>Carrier Reference No.: ${data.carrierReference}</div>
              <div>Departure Time: ${data.departureTime}</div>
            </div>
            <div class="section">
              <div class="section-title">Parties Involved</div>
              <div><strong>Shipper:</strong> ${data.shipper.name}</div>
              <div>${data.shipper.address}</div>
              <div>${data.shipper.phone}</div>
              <div>${data.shipper.email}</div>
              <br/>
              <div><strong>Consignee:</strong> ${data.consignee.name}</div>
              <div>${data.consignee.address}</div>
              <div>${data.consignee.phone}</div>
              <div>${data.consignee.email}</div>
              <br/>
              <div><strong>Status:</strong> ${data.status}</div>
              <div><strong>Comment:</strong> ${data.comment}</div>
            </div>
          </div>
          
          <div class="package-grid">
            <div class="package-item">
              <div class="package-label">Type of Shipment</div>
              <div>${data.shipmentType}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Packages</div>
              <div>${data.packages}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Product</div>
              <div>${data.product}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Total Freight</div>
              <div>${data.totalFreight}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Quantity</div>
              <div>${data.quantity}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Weight</div>
              <div>${data.weight}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Payment Mode</div>
              <div>${data.paymentMode}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Mode</div>
              <div>${data.mode}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Tracking</div>
              <div style="font-family: monospace;">${data.trackingNumber}</div>
            </div>
          </div>
        </div>
        
        <div class="waybill-copy">
          <div class="header">
            <div style="display: flex; align-items: center;">
              <div class="logo">LF</div>
              <div class="company-info">
                <div style="font-size: 24px; font-weight: bold;">LOGISTICA FALCON</div>
                <div style="font-size: 14px;">LOGISTICA</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="barcode">
                <div class="barcode-pattern">
                  ${Array.from({ length: 20 }, (_, i) => 
                    `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                  ).join('')}
                </div>
                <div class="barcode-text">${data.trackingNumber}</div>
              </div>
              <div style="font-weight: bold; margin-top: 10px;">Consignee Copy</div>
            </div>
          </div>
          
          <div class="grid">
            <div class="section">
              <div class="section-title">Shipment Logistics</div>
              <div>Pickup Date/Time: ${data.pickupDate} ${data.pickupTime}</div>
              <div>Delivery Date: ${data.deliveryDate}</div>
              <div>Destination: ${data.destination}</div>
              <div>Origin: ${data.origin}</div>
              <div>Courier: ${data.courier}</div>
              <div>Carrier: ${data.carrier}</div>
              <div>Carrier Reference No.: ${data.carrierReference}</div>
              <div>Departure Time: ${data.departureTime}</div>
            </div>
            <div class="section">
              <div class="section-title">Parties Involved</div>
              <div><strong>Shipper:</strong> ${data.shipper.name}</div>
              <div>${data.shipper.address}</div>
              <div>${data.shipper.phone}</div>
              <div>${data.shipper.email}</div>
              <br/>
              <div><strong>Consignee:</strong> ${data.consignee.name}</div>
              <div>${data.consignee.address}</div>
              <div>${data.consignee.phone}</div>
              <div>${data.consignee.email}</div>
              <br/>
              <div><strong>Status:</strong> ${data.status}</div>
              <div><strong>Comment:</strong> ${data.comment}</div>
            </div>
          </div>
          
          <div class="package-grid">
            <div class="package-item">
              <div class="package-label">Type of Shipment</div>
              <div>${data.shipmentType}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Packages</div>
              <div>${data.packages}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Product</div>
              <div>${data.product}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Total Freight</div>
              <div>${data.totalFreight}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Quantity</div>
              <div>${data.quantity}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Weight</div>
              <div>${data.weight}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Payment Mode</div>
              <div>${data.paymentMode}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Mode</div>
              <div>${data.mode}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Tracking</div>
              <div style="font-family: monospace;">${data.trackingNumber}</div>
            </div>
          </div>
        </div>
        
        <div class="waybill-copy">
          <div class="header">
            <div style="display: flex; align-items: center;">
              <div class="logo">LF</div>
              <div class="company-info">
                <div style="font-size: 24px; font-weight: bold;">LOGISTICA FALCON</div>
                <div style="font-size: 14px;">LOGISTICA</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="barcode">
                <div class="barcode-pattern">
                  ${Array.from({ length: 20 }, (_, i) => 
                    `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                  ).join('')}
                </div>
                <div class="barcode-text">${data.trackingNumber}</div>
              </div>
              <div style="font-weight: bold; margin-top: 10px;">Shippers Copy</div>
            </div>
          </div>
          
          <div class="grid">
            <div class="section">
              <div class="section-title">Shipment Logistics</div>
              <div>Pickup Date/Time: ${data.pickupDate} ${data.pickupTime}</div>
              <div>Delivery Date: ${data.deliveryDate}</div>
              <div>Destination: ${data.destination}</div>
              <div>Origin: ${data.origin}</div>
              <div>Courier: ${data.courier}</div>
              <div>Carrier: ${data.carrier}</div>
              <div>Carrier Reference No.: ${data.carrierReference}</div>
              <div>Departure Time: ${data.departureTime}</div>
            </div>
            <div class="section">
              <div class="section-title">Parties Involved</div>
              <div><strong>Shipper:</strong> ${data.shipper.name}</div>
              <div>${data.shipper.address}</div>
              <div>${data.shipper.phone}</div>
              <div>${data.shipper.email}</div>
              <br/>
              <div><strong>Consignee:</strong> ${data.consignee.name}</div>
              <div>${data.consignee.address}</div>
              <div>${data.consignee.phone}</div>
              <div>${data.consignee.email}</div>
              <br/>
              <div><strong>Status:</strong> ${data.status}</div>
              <div><strong>Comment:</strong> ${data.comment}</div>
            </div>
          </div>
          
          <div class="package-grid">
            <div class="package-item">
              <div class="package-label">Type of Shipment</div>
              <div>${data.shipmentType}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Packages</div>
              <div>${data.packages}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Product</div>
              <div>${data.product}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Total Freight</div>
              <div>${data.totalFreight}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Quantity</div>
              <div>${data.quantity}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Weight</div>
              <div>${data.weight}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Payment Mode</div>
              <div>${data.paymentMode}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Mode</div>
              <div>${data.mode}</div>
            </div>
            <div class="package-item">
              <div class="package-label">Tracking</div>
              <div style="font-family: monospace;">${data.trackingNumber}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waybill-${data.trackingNumber}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const WaybillCopy = ({ copyType }: { copyType: string }) => (
    <div className="border border-gray-300 bg-white p-6 mb-6 print:mb-4 print:break-inside-avoid">
      {/* Header/Branding Section */}
      <div className="flex justify-between items-start mb-6">
        {/* Logo and Company Name */}
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="text-white text-2xl font-bold">LF</div>
          </div>
          <div>
            <div className="text-blue-600 font-bold text-xl">LOGISTICA FALCON</div>
            <div className="text-blue-500 text-sm">LOGISTICA</div>
          </div>
        </div>

        {/* Barcode and Copy Type */}
        <div className="text-right">
          <Barcode value={data.trackingNumber} />
          <div className="text-sm font-semibold text-gray-700">{copyType}</div>
        </div>
      </div>

      {/* Shipment Logistics Section */}
      <div className="grid grid-cols-3 gap-4 mb-6 border border-gray-300">
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Pickup Date/Time</div>
          <div className="text-sm">{data.pickupDate} {data.pickupTime}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Delivery Date</div>
          <div className="text-sm">{data.deliveryDate}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Origin</div>
          <div className="text-sm">{data.origin}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Destination</div>
          <div className="text-sm">{data.destination}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Courier</div>
          <div className="text-sm">{data.courier}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Carrier</div>
          <div className="text-sm">{data.carrier}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Carrier Reference No.</div>
          <div className="text-sm">{data.carrierReference}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Departure Time</div>
          <div className="text-sm">{data.departureTime}</div>
        </div>
      </div>

      {/* Parties Involved Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 border border-gray-300">
          <div className="text-xs font-semibold text-gray-600 mb-2">Shipper</div>
          <div className="text-sm space-y-1">
            <div className="font-medium">{data.shipper.name}</div>
            <div className="text-xs">{data.shipper.address}</div>
            <div className="text-xs">{data.shipper.phone}</div>
            <div className="text-xs">{data.shipper.email}</div>
          </div>
        </div>
        <div className="p-3 border border-gray-300">
          <div className="text-xs font-semibold text-gray-600 mb-2">Consignee</div>
          <div className="text-sm space-y-1">
            <div className="font-medium">{data.consignee.name}</div>
            <div className="text-xs">{data.consignee.address}</div>
            <div className="text-xs">{data.consignee.phone}</div>
            <div className="text-xs">{data.consignee.email}</div>
          </div>
        </div>
        <div className="p-3 border border-gray-300">
          <div className="text-xs font-semibold text-gray-600 mb-2">Status</div>
          <div className="text-sm mb-2">{data.status}</div>
          <div className="text-xs font-semibold text-gray-600 mb-1">Comment</div>
          <div className="text-xs">{data.comment}</div>
        </div>
      </div>

      {/* Package Details Section */}
      <div className="grid grid-cols-3 gap-4 border border-gray-300">
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Type of Shipment</div>
          <div className="text-sm">{data.shipmentType}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Packages</div>
          <div className="text-sm">{data.packages}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Product</div>
          <div className="text-sm">{data.product}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Total Freight</div>
          <div className="text-sm">{data.totalFreight}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Quantity</div>
          <div className="text-sm">{data.quantity}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Weight</div>
          <div className="text-sm">{data.weight}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Payment Mode</div>
          <div className="text-sm">{data.paymentMode}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Mode</div>
          <div className="text-sm">{data.mode}</div>
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Tracking</div>
          <div className="text-sm font-mono">{data.trackingNumber}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white relative">
      {/* Print Button - Positioned on top of white background */}
      <div className="absolute top-4 right-4 z-10 print:hidden">
        <div className="flex space-x-2">
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isDownloading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? "Printing..." : "Print Waybill"}
          </Button>
        </div>
      </div>

      {/* Waybill Content with top padding for buttons */}
      <div className="pt-16 space-y-6">
        <WaybillCopy copyType="Accounts Copy" />
        <WaybillCopy copyType="Consignee Copy" />
        <WaybillCopy copyType="Shippers Copy" />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
