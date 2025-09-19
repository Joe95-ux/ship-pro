"use client";

import { useState, useEffect } from "react";
import { 
  Filter, 
  X, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Package, 
  Clock,
  Save,
  RotateCcw,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface AdvancedFilters {
  // Basic filters
  search: string;
  status: string;
  service: string;
  dateFrom: string;
  dateTo: string;
  
  // Advanced filters
  priceRange: {
    min: string;
    max: string;
  };
  weightRange: {
    min: string;
    max: string;
  };
  shipmentTypes: string[];
  paymentModes: string[];
  priority: string;
  deliveryTimeframe: string;
  originCountry: string;
  destinationCountry: string;
  senderName: string;
  receiverName: string;
  trackingNumber: string;
  
  // Saved filters
  savedFilterName: string;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onSaveFilter: (name: string, filters: AdvancedFilters) => void;
  onLoadFilter: (name: string) => void;
  savedFilters: Array<{ name: string; filters: AdvancedFilters }>;
  onClearFilters: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  savedFilters,
  onClearFilters
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'saved'>('basic');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateNestedFilter = (parentKey: keyof AdvancedFilters, childKey: string, value: any) => {
    onFiltersChange({
      ...filters,
      [parentKey]: {
        ...(filters[parentKey] as any),
        [childKey]: value
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.service && filters.service !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.weightRange.min || filters.weightRange.max) count++;
    if (filters.shipmentTypes.length > 0) count++;
    if (filters.paymentModes.length > 0) count++;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.deliveryTimeframe && filters.deliveryTimeframe !== 'all') count++;
    if (filters.originCountry) count++;
    if (filters.destinationCountry) count++;
    if (filters.senderName) count++;
    if (filters.receiverName) count++;
    if (filters.trackingNumber) count++;
    return count;
  };

  const handleSaveFilter = () => {
    if (newFilterName.trim()) {
      onSaveFilter(newFilterName.trim(), filters);
      setNewFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (filterName: string) => {
    onLoadFilter(filterName);
    setIsOpen(false);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center space-x-2",
              activeFiltersCount > 0 && "border-blue-500 bg-blue-50"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Advanced Filters</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeTab === 'basic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('basic')}
                  className="flex-1 h-7 text-xs"
                >
                  Basic
                </Button>
                <Button
                  variant={activeTab === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('advanced')}
                  className="flex-1 h-7 text-xs"
                >
                  Advanced
                </Button>
                <Button
                  variant={activeTab === 'saved' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('saved')}
                  className="flex-1 h-7 text-xs"
                >
                  Saved
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              {/* Basic Filters Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Search</Label>
                    <Input
                      placeholder="Search by tracking number, sender, or receiver..."
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                          <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Service</Label>
                      <Select value={filters.service} onValueChange={(value) => updateFilter('service', value)}>
                        <SelectTrigger className="mt-1">
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
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Date From</Label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => updateFilter('dateFrom', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Date To</Label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => updateFilter('dateTo', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Filters Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Price Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        placeholder="Min Price"
                        value={filters.priceRange.min}
                        onChange={(e) => updateNestedFilter('priceRange', 'min', e.target.value)}
                      />
                      <Input
                        placeholder="Max Price"
                        value={filters.priceRange.max}
                        onChange={(e) => updateNestedFilter('priceRange', 'max', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Weight Range (kg)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        placeholder="Min Weight"
                        value={filters.weightRange.min}
                        onChange={(e) => updateNestedFilter('weightRange', 'min', e.target.value)}
                      />
                      <Input
                        placeholder="Max Weight"
                        value={filters.weightRange.max}
                        onChange={(e) => updateNestedFilter('weightRange', 'max', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Shipment Types</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['DOCUMENT', 'PACKAGE', 'FRAGILE', 'HAZARDOUS', 'ELECTRONICS', 'CLOTHING'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={filters.shipmentTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter('shipmentTypes', [...filters.shipmentTypes, type]);
                              } else {
                                updateFilter('shipmentTypes', filters.shipmentTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <Label htmlFor={type} className="text-xs">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Payment Modes</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['CASH', 'CARD', 'BANK_TRANSFER', 'CRYPTO', 'PAYPAL'].map((mode) => (
                        <div key={mode} className="flex items-center space-x-2">
                          <Checkbox
                            id={mode}
                            checked={filters.paymentModes.includes(mode)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter('paymentModes', [...filters.paymentModes, mode]);
                              } else {
                                updateFilter('paymentModes', filters.paymentModes.filter(m => m !== mode));
                              }
                            }}
                          />
                          <Label htmlFor={mode} className="text-xs">{mode.replace('_', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Delivery Timeframe</Label>
                      <Select value={filters.deliveryTimeframe} onValueChange={(value) => updateFilter('deliveryTimeframe', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Timeframes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Timeframes</SelectItem>
                          <SelectItem value="same_day">Same Day</SelectItem>
                          <SelectItem value="next_day">Next Day</SelectItem>
                          <SelectItem value="2_3_days">2-3 Days</SelectItem>
                          <SelectItem value="1_week">1 Week</SelectItem>
                          <SelectItem value="2_weeks">2 Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Origin Country</Label>
                      <Input
                        placeholder="e.g., USA, Canada"
                        value={filters.originCountry}
                        onChange={(e) => updateFilter('originCountry', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Destination Country</Label>
                      <Input
                        placeholder="e.g., UK, Germany"
                        value={filters.destinationCountry}
                        onChange={(e) => updateFilter('destinationCountry', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Sender Name</Label>
                      <Input
                        placeholder="Sender name"
                        value={filters.senderName}
                        onChange={(e) => updateFilter('senderName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Receiver Name</Label>
                      <Input
                        placeholder="Receiver name"
                        value={filters.receiverName}
                        onChange={(e) => updateFilter('receiverName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tracking Number</Label>
                    <Input
                      placeholder="Specific tracking number"
                      value={filters.trackingNumber}
                      onChange={(e) => updateFilter('trackingNumber', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Saved Filters Tab */}
              {activeTab === 'saved' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Saved Filters</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                      className="h-7 px-2 text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save Current
                    </Button>
                  </div>
                  
                  {savedFilters.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No saved filters</p>
                      <p className="text-xs">Create and save filter combinations for quick access</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedFilters.map((savedFilter, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="text-sm font-medium">{savedFilter.name}</p>
                            <p className="text-xs text-gray-500">
                              {Object.keys(savedFilter.filters).filter(key => 
                                savedFilter.filters[key as keyof AdvancedFilters] && 
                                savedFilter.filters[key as keyof AdvancedFilters] !== 'all' &&
                                savedFilter.filters[key as keyof AdvancedFilters] !== ''
                              ).length} filters applied
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadFilter(savedFilter.name)}
                            className="h-7 px-2 text-xs"
                          >
                            Load
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-sm">Save Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Filter Name</Label>
                <Input
                  placeholder="Enter filter name"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveFilter}
                  disabled={!newFilterName.trim()}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
