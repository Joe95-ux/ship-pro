"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  Search,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getMostRecentShipment } from "@/lib/dashboard-actions";
import GoogleMap from "@/components/GoogleMap";
import type { MapConfig } from "@/lib/types";
import getLatLonForCity from "@/lib/getLatLon";

interface TrackingEvent {
  id: string;
  status: string;
  description: string | null;
  timestamp: Date;
  location?: unknown;
}

interface TrackingData {
  trackingNumber: string;
  status: string;
  progress?: number;
  sender?: { name: string };
  receiver?: { name: string };
  currentLocation?: {
    name?: string;
    address?: {
      city?: string;
      country?: string;
    };
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  events?: TrackingEvent[];
}

export function TrackingWidget() {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState("");

  useEffect(() => {
    loadMostRecentShipment();
  }, []);

  useEffect(() => {
    if (trackingData) {
      loadMap();
    }
  }, [trackingData]);

  const loadMostRecentShipment = async () => {
    try {
      setIsLoading(true);
      const data = await getMostRecentShipment();
      setTrackingData(data as unknown as TrackingData);
    } catch (error) {
      console.error('Failed to load most recent shipment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMap = async () => {
    if (!trackingData) return;

    try {
      let currentLocationCoords;
      if (trackingData.currentLocation?.address) {
        try {
          const coords = await getLatLonForCity(
            trackingData.currentLocation.address.city || '',
            trackingData.currentLocation.address.country || ''
          );
          currentLocationCoords = {
            latitude: coords.lat,
            longitude: coords.lon
          };
        } catch (error) {
          console.error('Failed to geolocate current location:', error);
          currentLocationCoords = { latitude: 40.7128, longitude: -74.0060 };
        }
      } else {
        currentLocationCoords = trackingData.currentLocation?.coordinates || { latitude: 40.7128, longitude: -74.0060 };
      }

      const currentLocationName = trackingData.currentLocation?.name || 'Current Package Location';

      const markers = [{
        id: 'current',
        position: currentLocationCoords,
        title: '📦 Package Location',
        description: currentLocationName,
        type: 'current' as const
      }];

      const config: MapConfig = {
        center: currentLocationCoords,
        zoom: 8,
        markers,
        polyline: []
      };

      setMapConfig(config);
      setMapLoaded(true);
    } catch (error) {
      console.error('Failed to load map:', error);
    }
  };

  const handleTrackPackage = async () => {
    if (!searchTrackingNumber.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tracking/${searchTrackingNumber}`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
        setSearchTrackingNumber("");
      }
    } catch (error) {
      console.error('Failed to track package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "picked_up":
      case "package picked up":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "in_transit":
      case "in transit":
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case "out_for_delivery":
      case "out for delivery":
        return <MapPin className="h-5 w-5 text-orange-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "picked_up":
      case "package picked up":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
      case "in transit":
        return "bg-yellow-100 text-yellow-800";
      case "out_for_delivery":
      case "out for delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case "PICKED_UP":
        return "Package Picked Up";
      case "IN_TRANSIT":
        return "In Transit";
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery";
      case "DELIVERED":
        return "Delivered";
      case "PENDING":
        return "Pending";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const formatDateTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Tracking Delivery</CardTitle>
              <p className="text-sm text-gray-600">Track your package in real-time</p>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          {/* Search Input Skeleton */}
          <div className="flex space-x-2">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Shipment Info Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>

            {/* Progress Bar Skeleton */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Delivery Progress</span>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="relative flex items-center">
                  <div className="w-full h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-gray-300 rounded-full w-1/3 animate-pulse"></div>
                  </div>
                  <div className="relative flex justify-between w-full">
                    {[0, 33, 66, 100].map((step, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full border-2 ${
                          index <= 1 ? "bg-gray-300 border-gray-300" : "bg-white border-gray-300"
                        } animate-pulse`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Skeleton */}
            <div className="h-72 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-500">Loading map...</p>
              </div>
            </div>

            {/* Timeline Skeleton */}
            <div className="relative">
              <div className="absolute left-5 top-6 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <CardTitle className="text-lg font-semibold text-gray-900">Tracking Delivery</CardTitle>
            <p className="text-sm text-gray-600">Track your package in real-time</p>
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
      <CardContent className="space-y-4 flex-1">
        {/* Search Input */}
        <div className="flex space-x-2">
          <Input
            type="text"
            value={searchTrackingNumber}
            onChange={(e) => setSearchTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1"
            onKeyUp={(e) => e.key === "Enter" && handleTrackPackage()}
          />
          <Button
            onClick={handleTrackPackage}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {trackingData && (
          <>
            {/* Current Shipment Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{trackingData.trackingNumber}
                  </p>
                  <p className="text-xs text-gray-600">
                    {trackingData.sender?.name} → {trackingData.receiver?.name}
                  </p>
                </div>
                <Badge className={getStatusColor(trackingData.status)}>
                  {formatStatus(trackingData.status)}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Delivery Progress</span>
                  <span>{trackingData.progress || 0}%</span>
                </div>
                {/* Custom Progress Bar */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      Order Processed
                    </span>
                    <span className="text-xs text-gray-500">
                      Order Shipped
                    </span>
                    <span className="text-xs text-gray-500">En Route</span>
                    <span className="text-xs text-gray-500">Arrived</span>
                  </div>
                  <div className="relative flex items-center">
                    {/* Progress line */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-1 bg-gray-200 rounded-full">
                        <div
                          className="h-1 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${trackingData.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Progress steps */}
                    <div className="relative flex justify-between w-full">
                      {[0, 33, 66, 100].map((step, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            (trackingData.progress || 0) >= step
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {(trackingData.progress || 0) >= step && (
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="h-72 rounded-lg overflow-hidden mb-8">
                {mapConfig ? (
                  <GoogleMap
                    config={mapConfig}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Add CSS for animated dashed line */}
                <style jsx>{`
                  @keyframes dash {
                    from {
                      stroke-dashoffset: 20;
                    }
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                  .animated-dash {
                    stroke-dasharray: 5 5;
                    animation: dash 1.5s linear infinite;
                  }
                `}</style>

                {/* Vertical dashed line - centered with larger icons */}
                <div className="absolute left-5 top-6 bottom-0 w-0.5">
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 2 100%"
                  >
                    <line
                      x1="1"
                      y1="0"
                      x2="1"
                      y2="100%"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                      className="animated-dash"
                    />
                  </svg>
                </div>

                <div className="space-y-6">
                  {trackingData.events?.slice(0, 3).reverse().map((event: TrackingEvent, index: number) => {
                    const eventTimestamp = new Date(event.timestamp).getTime();
                    const mostRecentTimestamp = Math.max(
                      ...(trackingData.events || []).map((e: TrackingEvent) => new Date(e.timestamp).getTime())
                    );
                    const isLatestEvent = eventTimestamp === mostRecentTimestamp;
                    const isCompleted = isLatestEvent;
                    const isActive = isLatestEvent;
                    const isDelivered = event.status.toLowerCase().includes("delivered");

                    return (
                      <div
                        key={event.id}
                        className={`relative flex items-start space-x-4 transition-all duration-500 ease-in-out transform ${
                          index === 0 ? "animate-in slide-in-from-left-5" : ""
                        }`}
                        style={
                          index === 0
                            ? {
                                animationDelay: "100ms",
                                animationFillMode: "both",
                              }
                            : {}
                        }
                      >
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                              isCompleted || isDelivered
                                ? "bg-blue-500 border-2 border-white shadow-lg ring-2 ring-blue-100"
                                : isActive
                                ? "bg-blue-400 border-2 border-white shadow-lg ring-2 ring-blue-100 animate-pulse"
                                : "bg-gray-200 border-2 border-white shadow-md"
                            }`}
                          >
                            {(isActive || (isCompleted && index === 0)) && (
                              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25"></div>
                            )}
                            <div
                              className={`${
                                isCompleted || isDelivered || isActive
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            >
                              {getStatusIcon(event.status)}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4
                              className={`text-base font-semibold transition-colors duration-300 ${
                                isCompleted || isDelivered
                                  ? "text-gray-900"
                                  : isActive
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {formatStatus(event.status)}
                              {isDelivered && (
                                <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✅
                                </span>
                              )}
                            </h4>
                          </div>

                          <p className="text-sm text-gray-600 leading-relaxed mb-1">
                            {event.description || "No description available"}
                          </p>

                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              Location not available
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
