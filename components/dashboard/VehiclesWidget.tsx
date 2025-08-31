"use client";

import { useState, useEffect } from "react";
import { Truck, TrendingUp, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  onRouteVehicles: number;
  maintenanceVehicles: number;
  trend: number;
}

export function VehiclesWidget() {
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVehicleStats();
  }, []);

  const loadVehicleStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/vehicles/stats');
      if (response.ok) {
        const data = await response.json();
        setVehicleStats(data);
      }
    } catch (error) {
      console.error('Failed to load vehicle stats:', error);
      // Fallback to mock data
      setVehicleStats({
        totalVehicles: 89,
        activeVehicles: 67,
        onRouteVehicles: 45,
        maintenanceVehicles: 12,
        trend: 2.29
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Delivery Vehicles</CardTitle>
          <p className="text-sm text-gray-600">Vehicles operating on the road</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Delivery Vehicles</CardTitle>
            <p className="text-sm text-gray-600">Vehicles operating on the road</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Export Data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {vehicleStats?.totalVehicles || 0}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                +{vehicleStats?.trend || 0}% than last week
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">On-Route</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
