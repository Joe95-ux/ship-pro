"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Receipt,
  ChevronLeft,
  ChevronRight,
  Package,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShipmentListItem } from "@/lib/types";
import { deleteShipment, bulkDeleteShipments } from "@/lib/dashboard-actions";
import Link from "next/link";

interface Filters {
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  service: string;
}

interface ShipmentsTableProps {
  shipments: ShipmentListItem[];
  selectedShipments: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectShipment: (shipmentId: string, checked: boolean) => void;
  onBulkDelete: () => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function ShipmentsTable({
  shipments,
  selectedShipments,
  onSelectAll,
  onSelectShipment,
  onBulkDelete,
  filters,
  setFilters,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: ShipmentsTableProps) {
  const [showFilters, setShowFilters] = useState(false);

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

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = async (shipmentId: string) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
      try {
        await deleteShipment(shipmentId);
        // Refresh the table
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete shipment:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedShipments.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedShipments.length} shipments?`)) {
      try {
        await bulkDeleteShipments(selectedShipments);
        onBulkDelete();
      } catch (error) {
        console.error('Failed to delete shipments:', error);
      }
    }
  };

  const statusTabs = [
    { value: "all", label: "All Shipments" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "IN_TRANSIT", label: "In transit" },
    { value: "PENDING", label: "Pending" },
    { value: "PICKED_UP", label: "Processing" }
  ];

  const getCurrentStatusLabel = () => {
    const currentTab = statusTabs.find(tab => tab.value === filters.status);
    return currentTab ? currentTab.label : "All Shipments";
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tracking number, sender, or receiver..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>

        {selectedShipments.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete ({selectedShipments.length})</span>
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Service</label>
            <Select value={filters.service} onValueChange={(value) => setFilters({ ...filters, service: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="express">Express Delivery</SelectItem>
                <SelectItem value="standard">Standard Delivery</SelectItem>
                <SelectItem value="economy">Economy Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedShipments.length === shipments.length && shipments.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Order ID</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Company</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Arrival time</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Route</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div></TableCell>
                </TableRow>
              ))
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedShipments.includes(shipment.id)}
                      onCheckedChange={(checked) => onSelectShipment(shipment.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    #{shipment.trackingNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{shipment.shipmentType?.replace('_', ' ') || 'Package'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{shipment.senderName}</TableCell>
                  <TableCell>{formatDate(shipment.estimatedDelivery)}</TableCell>
                  <TableCell>
                    {shipment.senderName} - {shipment.receiverName}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${shipment.estimatedCost?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/shipments/${shipment.id}`} className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/shipments/${shipment.id}/edit`} className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(shipment.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/shipments/${shipment.id}/waybill`} className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Waybill
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/shipments/${shipment.id}/receipt`} className="flex items-center">
                            <Receipt className="h-4 w-4 mr-2" />
                            Receipt
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {shipments.length > 0 && (
            <span>
              {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, shipments.length)} of {shipments.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
