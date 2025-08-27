"use client";

import React from 'react';
import { Package, Calendar, MapPin, User, DollarSign, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { ReceiptData } from '@/lib/types';

interface ReceiptGeneratorProps {
  data: ReceiptData;
  onPrint?: () => void;
}

type AddressType = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function ReceiptGenerator({ data, onPrint }: ReceiptGeneratorProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: AddressType) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white" id="receipt">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-12 h-12 dhl-gradient rounded-lg flex items-center justify-center">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900">ShipPro</h1>
            <p className="text-sm text-gray-600">Professional Shipping Solutions</p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">SHIPPING RECEIPT</h2>
        <p className="text-gray-600">Receipt for Tracking Number: {data.trackingNumber}</p>
      </div>

      <div className="space-y-6">
        {/* Receipt Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Receipt Details
            </h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Receipt ID:</span> {data.shipmentId}</p>
              <p><span className="font-medium">Date Issued:</span> {formatDate(data.createdAt)}</p>
              <p><span className="font-medium">Service:</span> {data.service}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Information
            </h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Amount:</span> {data.currency} {data.cost.toFixed(2)}</p>
              <p><span className="font-medium">Status:</span> 
                <Badge className={`ml-2 ${getPaymentStatusColor(data.paymentStatus)}`}>
                  {data.paymentStatus}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sender & Receiver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Sender
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{data.sender.name}</p>
                <p className="text-gray-600">{formatAddress(data.sender.address)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Receiver
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{data.receiver.name}</p>
                <p className="text-gray-600">{formatAddress(data.receiver.address)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Package Details */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Package Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Weight</p>
              <p className="text-gray-900">{data.weight} lbs</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Length</p>
              <p className="text-gray-900">{data.dimensions.length} {data.dimensions.unit}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Width</p>
              <p className="text-gray-900">{data.dimensions.width} {data.dimensions.unit}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Height</p>
              <p className="text-gray-900">{data.dimensions.height} {data.dimensions.unit}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cost Breakdown */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Cost Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Shipping Cost:</span>
              <span>{data.currency} {data.cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>{data.currency} 0.00</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{data.currency} {data.cost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Terms and Conditions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Terms and Conditions</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• This receipt serves as proof of payment for shipping services.</li>
            <li>• Delivery times are estimates and not guaranteed.</li>
            <li>• Insurance claims must be filed within 30 days of delivery.</li>
            <li>• For questions or concerns, contact customer service at 1-800-SHIP-PRO.</li>
            <li>• Track your package at shippro.com/tracking using tracking number {data.trackingNumber}.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>ShipPro Inc. | 123 Logistics Ave, Ship City, SC 12345</p>
          <p>Phone: 1-800-SHIP-PRO | Email: support@shippro.com</p>
          <p>This receipt was generated on {formatDate(new Date())}</p>
        </div>
      </div>

      {/* Print Button */}
      {onPrint && (
        <div className="text-center mt-8 no-print">
          <button
            onClick={onPrint}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors print:hidden"
          >
            Print Receipt
          </button>
        </div>
      )}

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          #receipt {
            max-width: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
