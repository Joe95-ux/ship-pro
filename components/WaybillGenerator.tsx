"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

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
}

export function WaybillGenerator({ data }: WaybillGeneratorProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
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
          <div className="border border-black p-2 mb-2">
            <div className="h-8 bg-black mb-1"></div>
            <div className="text-xs font-mono">{data.trackingNumber}</div>
          </div>
          <div className="text-sm font-semibold text-gray-700">{copyType}</div>
        </div>
      </div>

      {/* Shipment Logistics Section */}
      <div className="grid grid-cols-3 gap-4 mb-6 border border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600">Pickup Date</div>
          <div className="font-semibold">{data.pickupDate}</div>
        </div>
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600">Pickup Time</div>
          <div className="font-semibold">{data.pickupTime}</div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600">Delivery Date</div>
          <div className="font-semibold">{data.deliveryDate}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Origin</div>
          <div className="font-semibold">{data.origin}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Destination</div>
          <div className="font-semibold">{data.destination}</div>
        </div>
        <div className="p-3 border-t border-gray-300">
          <div className="text-xs text-gray-600">Courier</div>
          <div className="font-semibold">{data.courier}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Carrier</div>
          <div className="font-semibold">{data.carrier}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Carrier Reference No.</div>
          <div className="font-semibold">{data.carrierReference}</div>
        </div>
        <div className="p-3 border-t border-gray-300">
          <div className="text-xs text-gray-600">Departure Time</div>
          <div className="font-semibold">{data.departureTime}</div>
        </div>
      </div>

      {/* Parties Involved Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Shipper */}
        <div className="border border-gray-300 p-4">
          <div className="font-bold text-lg mb-3">Shipper</div>
          <div className="space-y-2 text-sm">
            <div>
              <div className="font-semibold">{data.shipper.name}</div>
            </div>
            <div>
              <div className="text-gray-600">{data.shipper.address}</div>
            </div>
            <div>
              <div className="text-gray-600">{data.shipper.phone}</div>
            </div>
            <div>
              <div className="text-gray-600">{data.shipper.email}</div>
            </div>
          </div>
        </div>

        {/* Consignee */}
        <div className="border border-gray-300 p-4">
          <div className="font-bold text-lg mb-3">Consignee</div>
          <div className="space-y-2 text-sm">
            <div>
              <div className="font-semibold">{data.consignee.name}</div>
            </div>
            <div>
              <div className="text-gray-600">{data.consignee.address}</div>
            </div>
            <div>
              <div className="text-gray-600">{data.consignee.phone}</div>
            </div>
            <div>
              <div className="text-gray-600">{data.consignee.email}</div>
            </div>
          </div>
        </div>

        {/* Status and Comment */}
        <div className="border border-gray-300 p-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-600">Status</div>
              <div className="font-semibold text-red-600">{data.status}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Comment</div>
              <div className="text-sm text-gray-700">{data.comment}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Section */}
      <div className="grid grid-cols-3 gap-4 border border-gray-300">
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600">Type of Shipment</div>
          <div className="font-semibold">{data.shipmentType}</div>
        </div>
        <div className="p-3 border-r border-gray-300">
          <div className="text-xs text-gray-600">Packages</div>
          <div className="font-semibold">{data.packages}</div>
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-600">Product</div>
          <div className="font-semibold">{data.product}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Total Freight</div>
          <div className="font-semibold">{data.totalFreight}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Quantity</div>
          <div className="font-semibold">{data.quantity}</div>
        </div>
        <div className="p-3 border-t border-gray-300">
          <div className="text-xs text-gray-600">Weight</div>
          <div className="font-semibold">{data.weight}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Payment Mode</div>
          <div className="font-semibold">{data.paymentMode}</div>
        </div>
        <div className="p-3 border-r border-gray-300 border-t border-gray-300">
          <div className="text-xs text-gray-600">Mode</div>
          <div className="font-semibold">{data.mode}</div>
        </div>
        <div className="p-3 border-t border-gray-300">
          <div className="text-xs text-gray-600">Tracking</div>
          <div className="font-semibold">{data.trackingNumber}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Print Button */}
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} disabled={isPrinting} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />
          {isPrinting ? "Printing..." : "Print Waybill"}
        </Button>
      </div>

      {/* Waybill Copies */}
      <div className="space-y-0 print:space-y-0">
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
