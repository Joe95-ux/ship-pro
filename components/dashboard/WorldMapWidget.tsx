"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  MapPin, 
  TrendingUp,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CountryData {
  country: string;
  shipments: number;
  revenue: number;
  color: string;
}

interface WorldMapWidgetProps {
  isLoading?: boolean;
}

// Sample data - in real app, this would come from API
const sampleCountryData: CountryData[] = [
  { country: "United States", shipments: 45, revenue: 12500, color: "#3b82f6" },
  { country: "Canada", shipments: 23, revenue: 6800, color: "#ef4444" },
  { country: "United Kingdom", shipments: 18, revenue: 5200, color: "#10b981" },
  { country: "Germany", shipments: 15, revenue: 4200, color: "#f59e0b" },
  { country: "France", shipments: 12, revenue: 3500, color: "#8b5cf6" },
  { country: "Australia", shipments: 9, revenue: 2800, color: "#06b6d4" },
  { country: "Japan", shipments: 7, revenue: 2100, color: "#84cc16" },
  { country: "Brazil", shipments: 6, revenue: 1800, color: "#f97316" },
];

export function WorldMapWidget({ isLoading }: WorldMapWidgetProps) {
  const [countryData, setCountryData] = useState<CountryData[]>(sampleCountryData);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const totalShipments = countryData.reduce((sum, country) => sum + country.shipments, 0);
  const totalRevenue = countryData.reduce((sum, country) => sum + country.revenue, 0);

  const topCountries = [...countryData]
    .sort((a, b) => b.shipments - a.shipments)
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">World Map</CardTitle>
              <p className="text-sm text-gray-600">Shipments by country</p>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map Skeleton */}
          <div className="h-48 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Loading map...</p>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>

          {/* Countries Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">World Map</CardTitle>
            <p className="text-sm text-gray-600">Shipments by country</p>
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
        {/* World Map Visualization */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-gray-200 overflow-hidden">
          {/* Simple SVG World Map */}
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          >
            {/* World Map Paths - Simplified */}
            <path
              d="M 100 200 Q 150 180 200 200 Q 250 220 300 200 Q 350 180 400 200 Q 450 220 500 200 Q 550 180 600 200 Q 650 220 700 200 Q 750 180 800 200 Q 850 220 900 200"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
              opacity="0.6"
            />
            <path
              d="M 150 250 Q 200 230 250 250 Q 300 270 350 250 Q 400 230 450 250 Q 500 270 550 250 Q 600 230 650 250 Q 700 270 750 250 Q 800 230 850 250"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
              opacity="0.6"
            />
            
            {/* Country Markers */}
            {countryData.map((country, index) => {
              const x = 150 + (index * 100);
              const y = 200 + (Math.sin(index * 0.5) * 50);
              const size = Math.max(8, Math.min(20, country.shipments / 2));
              
              return (
                <g key={country.country}>
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={country.color}
                    opacity="0.8"
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedCountry(country.country)}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={size + 2}
                    fill="none"
                    stroke={selectedCountry === country.country ? "#1f2937" : "transparent"}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + size + 12}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#374151"
                    className="font-medium"
                  >
                    {country.shipments}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Overlay Info */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
            <div className="flex items-center space-x-1">
              <Globe className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">
                {countryData.length} Countries
              </span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Shipments</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{totalShipments}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Revenue</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Top Countries List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Top Countries</h4>
          {topCountries.map((country, index) => (
            <div
              key={country.country}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                selectedCountry === country.country
                  ? "bg-gray-100 border border-gray-300"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCountry(
                selectedCountry === country.country ? null : country.country
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: country.color }}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {country.country}
                </span>
                {index < 3 && (
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {country.shipments}
                </div>
                <div className="text-xs text-gray-500">
                  ${country.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Country Details */}
        {selectedCountry && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-gray-900">
                {selectedCountry}
              </h5>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setSelectedCountry(null)}
              >
                ×
              </Button>
            </div>
            {(() => {
              const country = countryData.find(c => c.country === selectedCountry);
              if (!country) return null;
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipments:</span>
                    <span className="font-medium">{country.shipments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">${country.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Market Share:</span>
                    <span className="font-medium">
                      {((country.shipments / totalShipments) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
