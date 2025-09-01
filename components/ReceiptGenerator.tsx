"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface ReceiptData {
  trackingNumber: string;
  shipper: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  packages: Array<{
    quantity: number;
    pieceType: string;
    description: string;
    length: number;
    width: number;
    height: number;
    weight: number;
  }>;
}

interface ReceiptGeneratorProps {
  data: ReceiptData;
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
    <div className="border border-black p-3 mb-2">
      <div className="flex items-center justify-center h-12 mb-2">
        {pattern.map((barType, index) => (
          <div
            key={index}
            className={`h-full ${barType === 'thick' ? 'w-1 bg-black' : 'w-0.5 bg-black'} mx-px`}
          />
        ))}
      </div>
      <div className="text-sm font-mono text-center">{value}</div>
    </div>
  );
};

export function ReceiptGenerator({ data, isModal }: ReceiptGeneratorProps) {
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
          <title>Receipt - ${data.trackingNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .company-subtitle { font-size: 14px; color: #666; }
            .barcode { border: 1px solid #000; padding: 12px; margin-bottom: 8px; text-align: center; }
            .barcode-pattern { height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
            .barcode-bar { background: #000; margin: 0 1px; }
            .barcode-text { font-size: 14px; font-family: monospace; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .section { border: 1px solid #ccc; padding: 15px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .package-table { border: 1px solid #ccc; margin-bottom: 20px; }
            .table-header { display: grid; grid-template-columns: repeat(7, 1fr); background: #374151; color: white; font-size: 14px; font-weight: bold; }
            .table-row { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #ccc; }
            .table-cell { padding: 12px; border-right: 1px solid #ccc; }
            .table-cell:last-child { border-right: none; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 14px; }
            @media print { 
              @page { margin: 0.5in; size: A4; }
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="company-name">LOGISTICA FALCON</div>
              <div class="company-subtitle">LOGISTICA</div>
              <div class="barcode">
                <div class="barcode-pattern">
                  ${Array.from({ length: 20 }, (_, i) => 
                    `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                  ).join('')}
                </div>
                <div class="barcode-text">${data.trackingNumber}</div>
              </div>
            </div>
            
            <div class="grid">
              <div class="section">
                <div class="section-title">SHIPPER DETAILS:</div>
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #374151;">${data.shipper.name}</div>
                </div>
                <div style="margin-bottom: 5px; color: #6b7280;">${data.shipper.phone}</div>
                <div style="margin-bottom: 5px; color: #6b7280;">${data.shipper.address}</div>
                <div style="color: #6b7280;">${data.shipper.email}</div>
              </div>
              <div class="section">
                <div class="section-title">RECEIVER DETAILS:</div>
                <div style="margin-bottom: 10px;">
                  <div style="font-weight: bold; color: #374151;">${data.receiver.name}</div>
                </div>
                <div style="margin-bottom: 5px; color: #6b7280;">${data.receiver.phone}</div>
                <div style="margin-bottom: 5px; color: #6b7280;">${data.receiver.address}</div>
                <div style="color: #6b7280;">${data.receiver.email}</div>
              </div>
            </div>
            
            <div>
              <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">PACKAGE DETAILS:</div>
              
              <div class="package-table">
                <div class="table-header">
                  <div class="table-cell">Qty.</div>
                  <div class="table-cell">Piece Type</div>
                  <div class="table-cell">Description</div>
                  <div class="table-cell">Length(cm)</div>
                  <div class="table-cell">Width(cm)</div>
                  <div class="table-cell">Height(cm)</div>
                  <div class="table-cell">Weight (kg)</div>
                </div>
                ${data.packages.length > 0 ? 
                  data.packages.map(pkg => `
                    <div class="table-row">
                      <div class="table-cell">${pkg.quantity}</div>
                      <div class="table-cell">${pkg.pieceType}</div>
                      <div class="table-cell">${pkg.description}</div>
                      <div class="table-cell">${pkg.length}</div>
                      <div class="table-cell">${pkg.width}</div>
                      <div class="table-cell">${pkg.height}</div>
                      <div class="table-cell">${pkg.weight}</div>
                    </div>
                  `).join('') : 
                  `<div class="table-row">
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                    <div class="table-cell"></div>
                  </div>`
                }
              </div>
              
              <div class="summary">
                <div style="text-align: left;">
                  <div style="font-weight: bold; color: #374151;">Total Volumetric Weight : ${data.packages.reduce((sum, pkg) => sum + ((pkg.length * pkg.width * pkg.height) / 6000), 0).toFixed(2)}kg.</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-weight: bold; color: #374151;">Total Volume : ${data.packages.reduce((sum, pkg) => sum + ((pkg.length * pkg.width * pkg.height) / 1000000), 0).toFixed(2)}cu. m.</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: bold; color: #374151;">Total Actual Weight : ${data.packages.reduce((sum, pkg) => sum + pkg.weight, 0).toFixed(2)}kg.</div>
                </div>
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

  // Calculate totals
  const totalVolumetricWeight = data.packages.reduce((sum, pkg) => {
    const volume = (pkg.length * pkg.width * pkg.height) / 6000; // Standard volumetric calculation
    return sum + volume;
  }, 0);

  const totalVolume = data.packages.reduce((sum, pkg) => {
    const volume = (pkg.length * pkg.width * pkg.height) / 1000000; // Convert to cubic meters
    return sum + volume;
  }, 0);

  const totalActualWeight = data.packages.reduce((sum, pkg) => sum + pkg.weight, 0);

  const handleDownload = () => {
    setIsDownloading(true);
    // Generate HTML content for download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${data.trackingNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .receipt { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .company-subtitle { font-size: 14px; color: #666; }
          .barcode { border: 1px solid #000; padding: 12px; margin-bottom: 8px; text-align: center; }
          .barcode-pattern { height: 48px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
          .barcode-bar { background: #000; margin: 0 1px; }
          .barcode-text { font-size: 14px; font-family: monospace; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .section { border: 1px solid #ccc; padding: 15px; }
          .section-title { font-weight: bold; margin-bottom: 10px; }
          .package-table { border: 1px solid #ccc; margin-bottom: 20px; }
          .table-header { display: grid; grid-template-columns: repeat(7, 1fr); background: #374151; color: white; font-size: 14px; font-weight: bold; }
          .table-row { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #ccc; }
          .table-cell { padding: 12px; border-right: 1px solid #ccc; }
          .table-cell:last-child { border-right: none; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 14px; }
          @media print { @page { margin: 0.5in; size: A4; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">LOGISTICA FALCON</div>
            <div class="company-subtitle">LOGISTICA</div>
            <div class="barcode">
              <div class="barcode-pattern">
                ${Array.from({ length: 20 }, (_, i) => 
                  `<div class="barcode-bar" style="width: ${(i % 3 === 0 ? '4px' : '2px')}; height: 100%;"></div>`
                ).join('')}
              </div>
              <div class="barcode-text">${data.trackingNumber}</div>
            </div>
          </div>
          
          <div class="grid">
            <div class="section">
              <div class="section-title">SHIPPER DETAILS:</div>
              <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; color: #374151;">${data.shipper.name}</div>
              </div>
              <div style="margin-bottom: 5px; color: #6b7280;">${data.shipper.phone}</div>
              <div style="margin-bottom: 5px; color: #6b7280;">${data.shipper.address}</div>
              <div style="color: #6b7280;">${data.shipper.email}</div>
            </div>
            <div class="section">
              <div class="section-title">RECEIVER DETAILS:</div>
              <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; color: #374151;">${data.receiver.name}</div>
              </div>
              <div style="margin-bottom: 5px; color: #6b7280;">${data.receiver.phone}</div>
              <div style="margin-bottom: 5px; color: #6b7280;">${data.receiver.address}</div>
              <div style="color: #6b7280;">${data.receiver.email}</div>
            </div>
          </div>
          
          <div>
            <div class="section-title" style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">PACKAGE DETAILS:</div>
            
            <div class="package-table">
              <div class="table-header">
                <div class="table-cell">Qty.</div>
                <div class="table-cell">Piece Type</div>
                <div class="table-cell">Description</div>
                <div class="table-cell">Length(cm)</div>
                <div class="table-cell">Width(cm)</div>
                <div class="table-cell">Height(cm)</div>
                <div class="table-cell">Weight (kg)</div>
              </div>
              ${data.packages.length > 0 ? 
                data.packages.map(pkg => `
                  <div class="table-row">
                    <div class="table-cell">${pkg.quantity}</div>
                    <div class="table-cell">${pkg.pieceType}</div>
                    <div class="table-cell">${pkg.description}</div>
                    <div class="table-cell">${pkg.length}</div>
                    <div class="table-cell">${pkg.width}</div>
                    <div class="table-cell">${pkg.height}</div>
                    <div class="table-cell">${pkg.weight}</div>
                  </div>
                `).join('') : 
                `<div class="table-row">
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                  <div class="table-cell"></div>
                </div>`
              }
            </div>
            
            <div class="summary">
              <div style="text-align: left;">
                <div style="font-weight: bold; color: #374151;">Total Volumetric Weight : ${data.packages.reduce((sum, pkg) => sum + ((pkg.length * pkg.width * pkg.height) / 6000), 0).toFixed(2)}kg.</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: bold; color: #374151;">Total Volume : ${data.packages.reduce((sum, pkg) => sum + ((pkg.length * pkg.width * pkg.height) / 1000000), 0).toFixed(2)}cu. m.</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: bold; color: #374151;">Total Actual Weight : ${data.packages.reduce((sum, pkg) => sum + pkg.weight, 0).toFixed(2)}kg.</div>
              </div>
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
    a.download = `receipt-${data.trackingNumber}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white relative">
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
            {isPrinting ? "Printing..." : "Print Receipt"}
          </Button>
        </div>
      </div>

      {/* Receipt Content with top padding for buttons */}
      <div className="pt-16">
        <div className="border border-gray-300 bg-white p-8 print:p-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8 border-b border-gray-300 pb-6">
            {/* Company Logo and Name */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">LOGISTICA FALCON</div>
              <div className="text-sm text-gray-600">LOGISTICA</div>
            </div>

            {/* Barcode */}
            <div className="text-right">
              <Barcode value={data.trackingNumber} />
            </div>
          </div>

          {/* Shipper and Receiver Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg mb-4 text-gray-800">SHIPPER DETAILS:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">{data.shipper.name}</div>
                </div>
                <div>
                  <div className="text-gray-600">{data.shipper.phone}</div>
                </div>
                <div>
                  <div className="text-gray-600">{data.shipper.address}</div>
                </div>
                <div>
                  <div className="text-gray-600">{data.shipper.email}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-lg mb-4 text-gray-800">RECEIVER DETAILS:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">{data.receiver.name}</div>
                </div>
                <div>
                  <div className="text-gray-600">{data.receiver.phone}</div>
                </div>
                <div>
                  <div className="text-gray-600">{data.receiver.address}</div>
                </div>
                <div>
                  <div className="text-gray-600">{data.receiver.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div>
            <div className="font-bold text-lg mb-4 text-gray-800">PACKAGE DETAILS:</div>
            
            {/* Package Table */}
            <div className="border border-gray-300 mb-6">
              {/* Table Header */}
              <div className="grid grid-cols-7 bg-gray-700 text-white text-sm font-semibold">
                <div className="p-3 border-r border-gray-600">Qty.</div>
                <div className="p-3 border-r border-gray-600">Piece Type</div>
                <div className="p-3 border-r border-gray-600">Description</div>
                <div className="p-3 border-r border-gray-600">Length(cm)</div>
                <div className="p-3 border-r border-gray-600">Width(cm)</div>
                <div className="p-3 border-r border-gray-600">Height(cm)</div>
                <div className="p-3">Weight (kg)</div>
              </div>

              {/* Table Body */}
              {data.packages.length > 0 ? (
                data.packages.map((pkg, index) => (
                  <div key={index} className="grid grid-cols-7 text-sm border-t border-gray-300">
                    <div className="p-3 border-r border-gray-300">{pkg.quantity}</div>
                    <div className="p-3 border-r border-gray-300">{pkg.pieceType}</div>
                    <div className="p-3 border-r border-gray-300">{pkg.description}</div>
                    <div className="p-3 border-r border-gray-300">{pkg.length}</div>
                    <div className="p-3 border-r border-gray-300">{pkg.width}</div>
                    <div className="p-3 border-r border-gray-300">{pkg.height}</div>
                    <div className="p-3">{pkg.weight}</div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-7 text-sm border-t border-gray-300">
                  <div className="p-3 border-r border-gray-300"></div>
                  <div className="p-3 border-r border-gray-300"></div>
                  <div className="p-3 border-r border-gray-300"></div>
                  <div className="p-3 border-r border-gray-300"></div>
                  <div className="p-3 border-r border-gray-300"></div>
                  <div className="p-3 border-r border-gray-300"></div>
                  <div className="p-3"></div>
                </div>
              )}
            </div>

            {/* Summary Information */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-left">
                <div className="font-semibold text-gray-700">Total Volumetric Weight : {totalVolumetricWeight.toFixed(2)}kg.</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700">Total Volume : {totalVolume.toFixed(2)}cu. m.</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-700">Total Actual Weight : {totalActualWeight.toFixed(2)}kg.</div>
              </div>
            </div>
          </div>
        </div>
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
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
