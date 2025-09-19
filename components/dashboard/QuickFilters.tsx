"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package
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
  onRemoveFilter: (filters: Partial<AdvancedFilters>) => void;
  activeFilters: AdvancedFilters;
}

export function QuickFilters({ onApplyFilter, onRemoveFilter, activeFilters }: QuickFiltersProps) {
  const quickFilters: QuickFilter[] = [
    {
      id: 'out_for_delivery',
      name: 'Out for Delivery',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Being delivered',
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      filters: {
        status: 'OUT_FOR_DELIVERY'
      }
    },
    {
      id: 'delivered',
      name: 'Delivered',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Completed',
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      filters: {
        status: 'DELIVERED'
      }
    },
    {
      id: 'in_transit',
      name: 'In Transit',
      icon: <Package className="h-4 w-4" />,
      description: 'On the way',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      filters: {
        status: 'IN_TRANSIT'
      }
    },
    {
      id: 'pending',
      name: 'Pending',
      icon: <Clock className="h-4 w-4" />,
      description: 'Awaiting pickup',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      filters: {
        status: 'PENDING'
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
              onClick={() => {
                if (isActive) {
                  onRemoveFilter(filter.filters);
                } else {
                  onApplyFilter(filter.filters);
                }
              }}
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
