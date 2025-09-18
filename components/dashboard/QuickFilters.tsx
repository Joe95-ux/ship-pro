"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Package,
  TrendingUp,
  Calendar,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvancedFilters } from "./AdvancedFilters";

interface QuickFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  filters: Partial<AdvancedFilters>;
  color: string;
}

interface QuickFiltersProps {
  onApplyFilter: (filters: Partial<AdvancedFilters>) => void;
  activeFilters: AdvancedFilters;
}

export function QuickFilters({ onApplyFilter, activeFilters }: QuickFiltersProps) {
  const quickFilters: QuickFilter[] = [
    {
      id: 'urgent_deliveries',
      name: 'Urgent Deliveries',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'High priority shipments',
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      filters: {
        priority: 'URGENT',
        status: 'IN_TRANSIT'
      }
    },
    {
      id: 'delayed_shipments',
      name: 'Delayed Shipments',
      icon: <Clock className="h-4 w-4" />,
      description: 'Overdue deliveries',
      color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      filters: {
        status: 'IN_TRANSIT',
        deliveryTimeframe: '2_weeks'
      }
    },
    {
      id: 'recent_deliveries',
      name: 'Recent Deliveries',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Delivered this week',
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      filters: {
        status: 'DELIVERED',
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    },
    {
      id: 'high_value',
      name: 'High Value',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Expensive shipments',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      filters: {
        priceRange: {
          min: '1000',
          max: ''
        }
      }
    },
    {
      id: 'fragile_items',
      name: 'Fragile Items',
      icon: <Package className="h-4 w-4" />,
      description: 'Handle with care',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      filters: {
        shipmentTypes: ['FRAGILE']
      }
    },
    {
      id: 'international',
      name: 'International',
      icon: <MapPin className="h-4 w-4" />,
      description: 'Cross-border shipments',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      filters: {
        originCountry: '',
        destinationCountry: ''
      }
    },
    {
      id: 'pending_processing',
      name: 'Pending Processing',
      icon: <Clock className="h-4 w-4" />,
      description: 'Awaiting pickup',
      color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      filters: {
        status: 'PENDING'
      }
    },
    {
      id: 'express_services',
      name: 'Express Services',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Fast delivery options',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      filters: {
        service: 'express',
        deliveryTimeframe: 'same_day'
      }
    }
  ];

  const isFilterActive = (filter: QuickFilter) => {
    // Check if any of the filter's properties match the active filters
    return Object.entries(filter.filters).some(([key, value]) => {
      const activeValue = activeFilters[key as keyof AdvancedFilters];
      
      if (key === 'shipmentTypes' || key === 'paymentModes') {
        return Array.isArray(value) && Array.isArray(activeValue) && 
               value.some(v => activeValue.includes(v));
      }
      
      if (key === 'priceRange' || key === 'weightRange') {
        const filterRange = value as { min: string; max: string };
        const activeRange = activeValue as { min: string; max: string };
        return filterRange.min === activeRange.min || filterRange.max === activeRange.max;
      }
      
      return activeValue === value;
    });
  };

  const getActiveCount = () => {
    return quickFilters.filter(filter => isFilterActive(filter)).length;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Quick Filters</h3>
        {getActiveCount() > 0 && (
          <Badge variant="secondary" className="text-xs">
            {getActiveCount()} active
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {quickFilters.map((filter) => {
          const isActive = isFilterActive(filter);
          
          return (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              onClick={() => onApplyFilter(filter.filters)}
              className={cn(
                "h-auto p-3 flex flex-col items-start space-y-1 text-left",
                filter.color,
                isActive && "ring-2 ring-blue-500 ring-offset-2"
              )}
            >
              <div className="flex items-center space-x-2 w-full">
                {filter.icon}
                <span className="text-xs font-medium truncate">{filter.name}</span>
              </div>
              <span className="text-xs opacity-75 text-left leading-tight">
                {filter.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
