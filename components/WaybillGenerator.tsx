"use client";

import React from 'react';
import { Package, Calendar, MapPin, User, Phone, Mail, Truck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { WaybillData } from '@/lib/types';

interface WaybillGeneratorProps {
  data: WaybillData;
  onPrint?: () => void;
}

type AddressType = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function WaybillGenerator({ data, onPrint }: WaybillGeneratorProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address: AddressType) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  // Simple barcode generator (for demo purposes)
  const generateBarcode = (data: string) => {
    return data.split('').map((char, index) => (
      <div
        key={index}
        className={`inline-block w-1 h-12 ${index % 2 === 0 ? 'bg-black' : 'bg-white border-x border-black'}`}
      />
    ));
  };

  return (
    <div className="max-w-5xl mx-auto bg-white" id="waybill">
      {/* Header */}
      <div className="border-2 border-black p-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 dhl-gradient rounded-lg flex items-center justify-center">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logistica Falcon</h1>
              <p className="text-sm text-gray-600">Professional Shipping & Logistics</p>
              <p className="text-xs text-gray-500">123 Logistics Ave, Ship City, SC 12345</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-red-600">WAYBILL</h2>
            <p className="text-sm font-medium">Date: {formatDate(data.createdAt)}</p>
            <p className="text-lg font-bold border-2 border-black px-3 py-1 mt-2">
              {data.trackingNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Sender Information */}
        <div className="border-2 border-black">
          <div className="bg-gray-900 text-white p-2">
            <h3 className="font-bold flex items-center">
              <User className="h-4 w-4 mr-2" />
              SENDER / SHIPPER
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <p className="font-bold text-lg">{data.sender.name}</p>
            <p className="text-sm">{formatAddress(data.sender.address)}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {data.sender.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {data.sender.email}
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="border-2 border-black">
          <div className="bg-gray-900 text-white p-2">
            <h3 className="font-bold flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              RECEIVER / CONSIGNEE
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <p className="font-bold text-lg">{data.receiver.name}</p>
            <p className="text-sm">{formatAddress(data.receiver.address)}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {data.receiver.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {data.receiver.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service and Package Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border-2 border-black">
          <div className="bg-red-600 text-white p-2">
            <h3 className="font-bold flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              SERVICE DETAILS
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <p><span className="font-medium">Service Type:</span> {data.service.name}</p>
            <p><span className="font-medium">Description:</span> {data.service.description}</p>
            <p><span className="font-medium">Estimated Delivery:</span> {formatDate(data.shipping.estimatedDelivery)}</p>
            <p><span className="font-medium">Shipping Cost:</span> {data.shipping.currency} {data.shipping.cost.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-2 border-black">
          <div className="bg-red-600 text-white p-2">
            <h3 className="font-bold flex items-center">
              <Package className="h-4 w-4 mr-2" />
              PACKAGE DETAILS
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <p><span className="font-medium">Weight:</span> {data.package.weight} lbs</p>
            <p><span className="font-medium">Dimensions:</span> {data.package.dimensions.length} x {data.package.dimensions.width} x {data.package.dimensions.height} {data.package.dimensions.unit}</p>
            <p><span className="font-medium">Description:</span> {data.package.description}</p>
            {data.package.value && (
              <p><span className="font-medium">Declared Value:</span> {data.shipping.currency} {data.package.value.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {data.specialInstructions && (
        <div className="border-2 border-black mb-6">
          <div className="bg-yellow-400 text-black p-2">
            <h3 className="font-bold flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              SPECIAL INSTRUCTIONS
            </h3>
          </div>
          <div className="p-4">
            <p className="text-sm">{data.specialInstructions}</p>
          </div>
        </div>
      )}

      {/* Barcode and Tracking */}
      <div className="border-2 border-black mb-6">
        <div className="bg-gray-100 p-4 text-center">
          <p className="text-sm font-medium mb-2">TRACKING BARCODE</p>
          <div className="flex justify-center mb-2">
            {generateBarcode(data.trackingNumber)}
          </div>
          <p className="font-mono text-xl font-bold">{data.trackingNumber}</p>
          <p className="text-xs text-gray-600 mt-2">
            Track online at: logisticafalcon.com/tracking
          </p>
        </div>
      </div>

      {/* Terms and Signature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border-2 border-black">
          <div className="bg-gray-100 p-2">
            <h3 className="font-bold text-sm">TERMS AND CONDITIONS</h3>
          </div>
          <div className="p-3 text-xs space-y-1">
            <p>• Shipment is subject to Logistica Falcon&apos;s standard terms and conditions.</p>
            <p>• Delivery times are estimates and not guaranteed.</p>
            <p>• Insurance claims must be filed within 30 days.</p>
            <p>• Shipper certifies that the contents are properly described and classified.</p>
            <p>• Logistica Falcon&apos;s liability is limited as per standard shipping terms.</p>
          </div>
        </div>

        <div className="border-2 border-black">
          <div className="bg-gray-100 p-2">
            <h3 className="font-bold text-sm">SHIPPER SIGNATURE</h3>
          </div>
          <div className="p-3 space-y-4">
            <div>
              <p className="text-xs mb-2">I certify that the contents and information are correct:</p>
              <div className="border-b border-gray-400 h-8"></div>
              <p className="text-xs mt-1">Signature</p>
            </div>
            <div>
              <div className="border-b border-gray-400 h-6"></div>
              <p className="text-xs mt-1">Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Handling Instructions */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="border border-black p-2 text-center">
          <div className="w-8 h-8 border-2 border-black rounded mx-auto mb-1"></div>
          <p className="text-xs">FRAGILE</p>
        </div>
        <div className="border border-black p-2 text-center">
          <div className="w-8 h-8 border-2 border-black rounded mx-auto mb-1"></div>
          <p className="text-xs">THIS WAY UP</p>
        </div>
        <div className="border border-black p-2 text-center">
          <div className="w-8 h-8 border-2 border-black rounded mx-auto mb-1"></div>
          <p className="text-xs">KEEP DRY</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p>This waybill was generated on {formatDate(new Date())}</p>
        <p>For customer service: 1-800-LOGISTICA | support@logisticafalcon.com</p>
      </div>

      {/* Print Button */}
      {onPrint && (
        <div className="text-center mt-8 no-print">
          <button
            onClick={onPrint}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
          >
            Print Waybill
          </button>
        </div>
      )}

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          #waybill {
            max-width: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
