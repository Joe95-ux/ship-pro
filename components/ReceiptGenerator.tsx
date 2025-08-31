"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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
}

export function ReceiptGenerator({ data }: ReceiptGeneratorProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
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

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Print Button */}
      <div className="flex justify-end mb-6 print:hidden">
        <Button onClick={handlePrint} disabled={isPrinting} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />
          {isPrinting ? "Printing..." : "Print Receipt"}
        </Button>
      </div>

      {/* Receipt Document */}
      <div className="border border-gray-300 bg-white p-8 print:p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-300 pb-6">
          {/* Left Side - Logo and Company Info */}
          <div className="flex items-start space-x-4">
            {/* Logo */}
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="text-white text-2xl font-bold">LF</div>
            </div>
            
            {/* Company Details */}
            <div>
              <div className="text-blue-600 font-bold text-2xl mb-1">LOGISTICA FALCON</div>
              <div className="text-blue-500 text-sm mb-2">LOGISTICA</div>
              <div className="text-sm text-gray-600 mb-1">Fast and reliable global freight | Logistica Falcon</div>
              <div className="text-sm text-gray-600 mb-2">Fast, Secure & Reliable shipping</div>
              <div className="text-sm text-blue-600">https://logisticafalcon.com</div>
            </div>
          </div>

          {/* Right Side - Barcode and Tracking */}
          <div className="text-right">
            <div className="border border-black p-3 mb-2">
              <div className="h-12 bg-black mb-2"></div>
              <div className="text-sm font-mono">{data.trackingNumber}</div>
            </div>
          </div>
        </div>

        {/* Shipper and Receiver Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 border-b border-gray-300 pb-6">
          {/* Shipper Details */}
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

          {/* Receiver Details */}
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
