"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, TrendingUp, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { scaleThreshold } from "d3-scale";
import {createMapPinIcon} from "@/components/divIcon";

// Dynamic import for React-Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Type definitions
interface CountryData {
  country: string;
  countryCode: string;
  shipmentCount: number;
  totalRevenue: number;
  sentFrom: number;
  receivedIn: number;
  coordinates: [number, number]; // Coordinates from API
}

interface WorldMapWidgetProps {
  isLoading?: boolean;
}

interface ApiResponse {
  totalShipments: number;
  totalRevenue: number;
  countries: CountryData[];
}

export function WorldMapWidget({ isLoading }: WorldMapWidgetProps) {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiTotals, setApiTotals] = useState({
    totalShipments: 0,
    totalRevenue: 0,
  });

  // Fetch shipment data from the correct API endpoint
  useEffect(() => {
    const fetchShipmentData = async () => {
      try {
        setIsLoadingData(true);

        const response = await fetch("/api/shipments/world");

        if (response.ok) {
          const data: ApiResponse = await response.json();
          console.log("API response data:", data);
          setCountryData(data.countries);
          setApiTotals({
            totalShipments: data.totalShipments,
            totalRevenue: data.totalRevenue,
          });
        } else {
          console.warn("Failed to fetch world shipment data");
          // Fallback to sample data if API fails
          const sampleData = getSampleData();
          setCountryData(sampleData.countries);
          setApiTotals({
            totalShipments: sampleData.totalShipments,
            totalRevenue: sampleData.totalRevenue,
          });
        }
      } catch (error) {
        console.error("Error fetching world shipment data:", error);
        // Fallback to sample data on error
        const sampleData = getSampleData();
        setCountryData(sampleData.countries);
        setApiTotals({
          totalShipments: sampleData.totalShipments,
          totalRevenue: sampleData.totalRevenue,
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchShipmentData();
  }, []);

  // Sample data fallback
  const getSampleData = (): ApiResponse => ({
    totalShipments: 6,
    totalRevenue: 15000,
    countries: [
      {
        country: "United States",
        countryCode: "USA",
        shipmentCount: 3,
        totalRevenue: 8000,
        sentFrom: 2,
        receivedIn: 1,
        coordinates: [39.8283, -98.5795],
      },
      {
        country: "Canada",
        countryCode: "CAN",
        shipmentCount: 2,
        totalRevenue: 4000,
        sentFrom: 1,
        receivedIn: 1,
        coordinates: [56.1304, -106.3468],
      },
      {
        country: "United Kingdom",
        countryCode: "GBR",
        shipmentCount: 1,
        totalRevenue: 3000,
        sentFrom: 0,
        receivedIn: 1,
        coordinates: [55.3781, -3.436],
      },
    ],
  });

  const topCountries = useMemo(
    () =>
      [...countryData]
        .sort((a, b) => b.shipmentCount - a.shipmentCount)
        .slice(0, 5),
    [countryData]
  );

  // Create color scale based on shipment data
  const colorScale = useMemo(() => {
    if (!countryData || countryData.length === 0) return null;

    const values = countryData.map((item) => item.shipmentCount);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    if (maxValue === minValue) {
      return () => "#ffeda0";
    }

    // Create a threshold scale with 5 levels
    return scaleThreshold<number, string>()
      .domain([
        minValue + (maxValue - minValue) * 0.2,
        minValue + (maxValue - minValue) * 0.4,
        minValue + (maxValue - minValue) * 0.6,
        minValue + (maxValue - minValue) * 0.8,
      ])
      .range(["#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#e31a1c"]);
  }, [countryData]);

  if (isLoading || isLoadingData) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Shipments by Country
              </CardTitle>
              <p className="text-sm text-gray-600">
                Global shipment distribution
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map Skeleton */}
          <div className="h-48 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Loading world map...</p>
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
            <CardTitle className="text-lg font-semibold text-gray-900">
              Shipments by Country
            </CardTitle>
            <p className="text-sm text-gray-600">
              Global shipment distribution
            </p>
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
          {/* React-Leaflet Map */}
          {typeof window !== "undefined" && (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              className="w-full h-full"
              zoomControl={true}
              attributionControl={false}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              dragging={true}
              touchZoom={true}
              minZoom={1}
              maxZoom={6}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Country Markers */}
              {countryData.map((country) => {
                if (!country.coordinates) return null;

                const color = colorScale
                  ? colorScale(country.shipmentCount)
                  : "#D3D3D3";

                return (
                  <Marker
                    key={country.countryCode}
                    position={country.coordinates}
                    icon={createMapPinIcon(
                      country.shipmentCount > 3
                        ? color
                        : country.shipmentCount > 2
                        ? "#fd8d3c"
                        : "#feb24c"
                    )}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>{country.country}</strong>
                        <br />
                        Total Shipments: {country.shipmentCount}
                        <br />
                        Sent From: {country.sentFrom}
                        <br />
                        Received In: {country.receivedIn}
                        <br />
                        Revenue: ${country.totalRevenue.toLocaleString()}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}

          {/* Map Overlay Info */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
            <div className="flex items-center space-x-1">
              <Globe className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">
                {countryData.length} Countries
              </span>
            </div>
          </div>

          {/* Color Legend */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-[#ffeda0] rounded"></div>
                <div className="w-3 h-3 bg-[#fed976] rounded"></div>
                <div className="w-3 h-3 bg-[#feb24c] rounded"></div>
                <div className="w-3 h-3 bg-[#fd8d3c] rounded"></div>
                <div className="w-3 h-3 bg-[#e31a1c] rounded"></div>
              </div>
              <span className="text-xs text-gray-600 font-medium">
                Shipments
              </span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Total Shipments
              </span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {apiTotals.totalShipments}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Revenue
              </span>
            </div>
            <div className="text-xl font-bold text-green-900">
              ${apiTotals.totalRevenue.toLocaleString()}
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
              onClick={() =>
                setSelectedCountry(
                  selectedCountry === country.country ? null : country.country
                )
              }
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: colorScale
                      ? colorScale(country.shipmentCount)
                      : "#D3D3D3",
                  }}
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
                  {country.shipmentCount}
                </div>
                <div className="text-xs text-gray-500">
                  Sent: {country.sentFrom} | Rec: {country.receivedIn}
                </div>
                <div className="text-xs text-gray-500">
                  ${country.totalRevenue.toLocaleString()}
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
              const country = countryData.find(
                (c) => c.country === selectedCountry
              );
              if (!country) return null;

              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Shipments:</span>
                    <span className="font-medium">{country.shipmentCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sent From:</span>
                    <span className="font-medium">{country.sentFrom}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Received In:</span>
                    <span className="font-medium">{country.receivedIn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">
                      ${country.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Market Share:</span>
                    <span className="font-medium">
                      {(
                        (country.shipmentCount / apiTotals.totalShipments) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Custom CSS for markers */}
        <style jsx global>{`
          .custom-marker {
            background: transparent;
            border: none;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
