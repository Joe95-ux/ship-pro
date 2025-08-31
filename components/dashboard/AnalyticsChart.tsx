"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface RevenueData {
  service: string;
  revenue: number;
  percentage: number;
  color: string;
}

export function AnalyticsChart() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(272980.19);

  useEffect(() => {
    // Generate realistic revenue data by service type
    const generateRevenueData = () => {
      const services = [
        { name: "International Shipping", color: "#3b82f6" },
        { name: "Air Freight", color: "#10b981" },
        { name: "Sea Transport", color: "#f59e0b" },
        { name: "Truckload", color: "#8b5cf6" },
        { name: "Van Transport", color: "#ef4444" }
      ];

      const data: RevenueData[] = [];
      let total = 0;

      // Generate revenue for each service
      services.forEach((service, index) => {
        const baseRevenue = 40000 + (index * 15000);
        const variation = Math.random() * 20000;
        const revenue = Math.round(baseRevenue + variation);
        total += revenue;

        data.push({
          service: service.name,
          revenue,
          percentage: 0, // Will be calculated after total
          color: service.color
        });
      });

      // Calculate percentages
      data.forEach(item => {
        item.percentage = Math.round((item.revenue / total) * 100);
      });

      setRevenueData(data);
      setTotalRevenue(total);
    };

    generateRevenueData();
  }, []);

  const revenueGrowth = 2.52; // Mock growth rate

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Analytics Overview</CardTitle>
            <p className="text-sm text-gray-600">Revenue by service type</p>
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
      <CardContent className="space-y-6">
        {/* Main Revenue Display */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-center space-x-1">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-600">vs last month</span>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 text-center">Revenue Distribution</h4>
          
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Pie Chart */}
              {(() => {
                let currentAngle = 0;
                return revenueData.map((item, index) => {
                  const angle = (item.percentage / 100) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M 50 50`,
                    `L ${x1} ${y1}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');
                  
                  currentAngle += angle;
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={item.color}
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  );
                });
              })()}
              
              {/* Center circle */}
              <circle cx="50" cy="50" r="15" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
            </svg>
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
            {revenueData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700 font-medium">{item.service}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${item.revenue.toLocaleString()}</div>
                  <div className="text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {revenueData.length}
                </div>
                <div className="text-xs text-gray-600">Services</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  ${Math.round(totalRevenue / revenueData.length).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Avg per Service</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
