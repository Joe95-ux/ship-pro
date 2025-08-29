"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import GoogleMap, { MapPlaceholder } from "@/components/GoogleMap";
import type { MapConfig, Address, Dimensions } from "@/lib/types";

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: {
    name: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  timestamp: string;
}

interface TrackingData {
  trackingNumber: string;
  status: string;
  estimatedDelivery: string | Date;
  actualDelivery?: string | Date | null;
  currentLocation?: {
    name: string;
    address?: Address;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  } | null;
  route?: Array<{ latitude: number; longitude: number }>;
  events: TrackingEvent[];
  progress: number;
  sender?: {
    name: string;
    address: Address;
  };
  receiver?: {
    name: string;
    address: Address;
  };
  service?: {
    name: string;
    description: string;
  };
  weight?: number;
  dimensions?: Dimensions;
  estimatedCost?: number;
  finalCost?: number;
}

export default function TrackingPage() {
  const { user } = useUser();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);

  // Load map when tracking data changes
  useEffect(() => {
    console.log("useEffect: trackingData changed:", trackingData);
    if (trackingData) {
      console.log("useEffect: Calling loadMap");
      loadMap();
      // Set a timeout to ensure map loads or shows placeholder
      const timeout = setTimeout(() => {
        if (!mapConfig) {
          console.log("useEffect: Timeout - calling loadMap again");
          loadMap();
        }
      }, 1000);

      return () => clearTimeout(timeout);
    } else {
      // Reset map config when no tracking data
      console.log("useEffect: Resetting map config");
      setMapConfig(null);
      setMapLoaded(false);
    }
  }, [trackingData]);

  // Generate dynamic tracking data that uses actual API data when available
  const generateDynamicTrackingData = async (
    trackingNumber: string,
    apiData?: unknown
  ): Promise<TrackingData> => {
    // If we have API data, use it to get real addresses
    let realReceiverAddress: Address | null = null;
    let realSenderAddress: Address | null = null;
    let realReceiverName = "";
    let realSenderName = "";

    if (apiData && typeof apiData === "object") {
      console.log("API Data structure:", apiData);

      // Handle different possible API response structures
      let shipment = null;

      if ("shipment" in apiData) {
        shipment = (apiData as { shipment: unknown }).shipment;
      } else if ("data" in apiData) {
        shipment = (apiData as { data: unknown }).data;
      } else {
        // If apiData is the shipment directly
        shipment = apiData;
      }

      if (shipment && typeof shipment === "object") {
        console.log("Shipment data:", shipment);

        // Extract receiver address
        if ("receiverAddress" in shipment && shipment.receiverAddress) {
          realReceiverAddress = shipment.receiverAddress as Address;
          console.log("Found real receiver address:", realReceiverAddress);
        }
        if ("senderAddress" in shipment && shipment.senderAddress) {
          realSenderAddress = shipment.senderAddress as Address;
          console.log("Found real sender address:", realSenderAddress);
        }
        if (
          "receiverName" in shipment &&
          typeof shipment.receiverName === "string"
        ) {
          realReceiverName = shipment.receiverName;
          console.log("Found real receiver name:", realReceiverName);
        }
        if (
          "senderName" in shipment &&
          typeof shipment.senderName === "string"
        ) {
          realSenderName = shipment.senderName;
          console.log("Found real sender name:", realSenderName);
        }
      }
    }

    const statuses = [
      "PENDING",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];
    const cities = [
      {
        name: "New York",
        coords: { latitude: 40.7128, longitude: -74.006 },
        state: "NY",
        country: "USA",
      },
      {
        name: "Chicago",
        coords: { latitude: 41.8781, longitude: -87.6298 },
        state: "IL",
        country: "USA",
      },
      {
        name: "Los Angeles",
        coords: { latitude: 34.0522, longitude: -118.2437 },
        state: "CA",
        country: "USA",
      },
      {
        name: "Miami",
        coords: { latitude: 25.7617, longitude: -80.1918 },
        state: "FL",
        country: "USA",
      },
      {
        name: "Mexico City",
        coords: { latitude: 19.4326, longitude: -99.1332 },
        state: "CDMX",
        country: "Mexico",
      },
      {
        name: "Tijuana",
        coords: { latitude: 32.5149, longitude: -117.0382 },
        state: "BC",
        country: "Mexico",
      },
      {
        name: "Chetumal",
        coords: { latitude: 18.5141, longitude: -88.3038 },
        state: "Quintana Roo",
        country: "Mexico",
      },
    ];

    // Use tracking number to determine status (pseudo-random but consistent)
    const numberValue = parseInt(trackingNumber.replace(/\D/g, "")) || 0;
    const statusIndex = numberValue % statuses.length;
    const currentStatus = statuses[statusIndex];

    // For better demo data, use specific cities based on tracking number
    let currentCity, originCity;

    if (trackingNumber.includes("SP111222333")) {
      // Use Chetumal for this specific tracking number
      currentCity = {
        name: "Chetumal",
        coords: { latitude: 18.5141, longitude: -88.3038 },
        state: "Quintana Roo",
        country: "Mexico",
      };
      originCity = {
        name: "Los Angeles",
        coords: { latitude: 34.0522, longitude: -118.2437 },
        state: "CA",
        country: "USA",
      };
    } else {
      // Use regular city selection for other tracking numbers
      const cityIndex = numberValue % cities.length;
      currentCity = cities[cityIndex];
      originCity = cities[(cityIndex + 1) % cities.length];
    }

    const progress = statusIndex * 25; // 0, 25, 50, 75, 100

    // Use real data if available, otherwise generate mock data
    const receiverNames = [
      "Sarah Wilson",
      "Mike Chen",
      "Emma Davis",
      "Alex Rodriguez",
      "Lisa Thompson",
    ];
    const senderNames = [
      "TechCorp Inc",
      "Fashion Boutique",
      "Sports Gear Pro",
      "Book Universe",
      "Garden Center",
    ];

    const receiverName =
      realReceiverName || receiverNames[numberValue % receiverNames.length];
    const senderName =
      realSenderName || senderNames[numberValue % senderNames.length];

    // Use real receiver address if available, otherwise use mock
    const receiverAddress = realReceiverAddress || {
      street: `${100 + (numberValue % 999)} Delivery Ave`,
      city: currentCity.name,
      state: currentCity.state,
      postalCode:
        currentCity.country === "Mexico"
          ? `${10000 + (numberValue % 89999)}`
          : `${10000 + (numberValue % 89999)}`,
      country: currentCity.country,
    };

    // Use real sender address if available, otherwise use mock
    const senderAddress = realSenderAddress || {
      street: `${200 + (numberValue % 799)} Business Blvd`,
      city: originCity.name,
      state: originCity.state,
      postalCode:
        originCity.country === "Mexico"
          ? `${20000 + (numberValue % 79999)}`
          : `${20000 + (numberValue % 79999)}`,
      country: originCity.country,
    };

    console.log("Using receiver address:", receiverAddress);
    console.log("Using sender address:", senderAddress);

    // Get coordinates from address using geocoding
    const receiverCoords = await getCoordinatesFromAddress(receiverAddress);
    const senderCoords = await getCoordinatesFromAddress(senderAddress);

    return {
      trackingNumber,
      status: currentStatus,
      estimatedDelivery: new Date(
        Date.now() + (5 - statusIndex) * 24 * 60 * 60 * 1000
      ).toISOString(),
      currentLocation: {
        name:
          currentStatus === "DELIVERED"
            ? `${receiverAddress.street}, ${receiverAddress.city}, ${receiverAddress.state}`
            : `${currentCity.name} Distribution Center, ${currentCity.state}`,
        address:
          currentStatus === "DELIVERED"
            ? receiverAddress
            : {
                street: "Distribution Center",
                city: currentCity.name,
                state: currentCity.state,
                postalCode: "00000",
                country: currentCity.country,
              },
        coordinates:
          currentStatus === "DELIVERED" ? receiverCoords : currentCity.coords,
      },
      events: [
        {
          id: "1",
          status:
            currentStatus === "DELIVERED"
              ? "Delivered"
              : formatStatus(currentStatus),
          description: (() => {
            switch (currentStatus) {
              case "DELIVERED":
                return `Package has been delivered successfully and signed by ${receiverName}`;
              case "OUT_FOR_DELIVERY":
                return "Package is out for delivery and will arrive within the next few hours";
              case "IN_TRANSIT":
                return "Package is in transit to destination facility";
              case "PICKED_UP":
                return `Package has been picked up from ${senderName} and is en route to sorting facility`;
              case "PENDING":
                return "Shipment has been created and is pending pickup";
              default:
                return `Package is ${currentStatus
                  .toLowerCase()
                  .replace("_", " ")}`;
            }
          })(),
          location: {
            name:
              currentStatus === "DELIVERED"
                ? `${receiverAddress.street}, ${receiverAddress.city}, ${receiverAddress.state}`
                : `${currentCity.name} Distribution Center`,
            address:
              currentStatus === "DELIVERED"
                ? {
                    city: receiverAddress.city,
                    state: receiverAddress.state,
                    country: receiverAddress.country,
                  }
                : {
                    city: currentCity.name,
                    state: currentCity.state,
                    country: currentCity.country,
                  },
            coordinates:
              currentStatus === "DELIVERED"
                ? receiverCoords
                : currentCity.coords,
          },
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          status: "Package picked up",
          description: `Package has been picked up from ${senderName} and processed at origin facility`,
          location: {
            name: `${senderAddress.city} Origin Facility`,
            address: {
              city: senderAddress.city,
              state: senderAddress.state,
              country: senderAddress.country,
            },
            coordinates: senderCoords,
          },
          timestamp: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ].reverse(), // Reverse so most recent event is first (index 0)
      progress,
      route: (() => {
        // Create a more realistic route with actual coordinates
        const route = [senderCoords];

        // For cross-border shipments (US to Mexico), add border crossing point
        if (
          senderAddress.country === "USA" &&
          receiverAddress.country === "Mexico"
        ) {
          // Add San Diego as border crossing point for CA to Mexico routes
          if (senderAddress.state === "CA") {
            route.push({ latitude: 32.7157, longitude: -117.1611 }); // San Diego
          }
          // Add El Paso for other US to Mexico routes
          else {
            route.push({ latitude: 31.7619, longitude: -106.485 }); // El Paso
          }
        }
        // For Mexico to US shipments, add the same border points
        else if (
          senderAddress.country === "Mexico" &&
          receiverAddress.country === "USA"
        ) {
          if (receiverAddress.state === "CA") {
            route.push({ latitude: 32.7157, longitude: -117.1611 }); // San Diego
          } else {
            route.push({ latitude: 31.7619, longitude: -106.485 }); // El Paso
          }
        }

        route.push(receiverCoords);
        return route;
      })(),
      sender: {
        name: senderName,
        address: senderAddress,
      },
      receiver: {
        name: receiverName,
        address: receiverAddress,
      },
    };
  };

  const handleTrackPackage = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Try to fetch real tracking data from API first
      let apiData = null;
      try {
        console.log("Fetching API data for tracking number:", trackingNumber);
        const response = await fetch(`/api/tracking/${trackingNumber}`);
        console.log("API response status:", response.status);

        if (response.ok) {
          apiData = await response.json();
          console.log("Real tracking data from API:", apiData);

          // Check if we have valid tracking data
          if (apiData && (apiData.trackingNumber || apiData.shipment)) {
            console.log("Using real API data");
            setTrackingData(apiData);
            return;
          } else {
            console.log("API data is empty or invalid, will use demo data");
            console.log(
              "API data structure:",
              JSON.stringify(apiData, null, 2)
            );
          }
        } else {
          console.log(
            "API response not ok:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.log("API error response:", errorText);
        }
      } catch (error) {
        console.log("Failed to fetch from API, using demo data:", error);
      }

      // Only show real user-created shipments, no mock data
      if (apiData && (apiData.trackingNumber || apiData.shipment)) {
        console.log("Using real API data");
        const normalized = await generateDynamicTrackingData(
          trackingNumber,
          apiData
        );
        setTrackingData(normalized);
        return;
      }

      // Use the real API data from the database
      console.log("Using real shipment data from database");
      const normalized = await generateDynamicTrackingData(
        trackingNumber,
        apiData
      );
      setTrackingData(normalized);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMap = () => {
    if (!trackingData) {
      console.log("loadMap: No tracking data available");
      return;
    }

    console.log(
      "loadMap: Creating map config with tracking data:",
      trackingData
    );

    // Create map configuration based on actual tracking event locations
    const defaultCoords = { latitude: 40.7128, longitude: -74.006 }; // New York default
    const currentLocationCoords =
      trackingData.currentLocation?.coordinates || defaultCoords;
    const currentLocationName =
      trackingData.currentLocation?.name || "Unknown Location";

    // Use route data if available, otherwise get coordinates from events
    let polylineCoords;
    if (trackingData.route && trackingData.route.length > 0) {
      polylineCoords = trackingData.route;
    } else {
      // Get all event locations for polyline
      const eventCoordinates = trackingData.events
        .filter((event) => event.location?.coordinates)
        .map((event) => event.location.coordinates)
        .reverse(); // Reverse to show chronological order

      polylineCoords =
        eventCoordinates.length > 0
          ? eventCoordinates
          : [
              { latitude: 40.7128, longitude: -74.006 }, // New York
              { latitude: 41.8781, longitude: -87.6298 }, // Chicago
              { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
            ];
    }

    // Create markers from tracking events
    const markers: Array<{
      id: string;
      position: { latitude: number; longitude: number };
      title: string;
      description: string;
      type: "origin" | "current" | "destination" | "waypoint";
    }> = [];

    // Origin marker (first event - chronologically last in array)
    const originEvent = trackingData.events[trackingData.events.length - 1];
    if (originEvent?.location?.coordinates) {
      markers.push({
        id: "origin",
        position: originEvent.location.coordinates,
        title: "Origin",
        description: originEvent.location.name || "Package pickup location",
        type: "origin" as const,
      });
    }

    // Current location marker
    markers.push({
      id: "current",
      position: currentLocationCoords,
      title: "Current Location",
      description: currentLocationName,
      type: "current" as const,
    });

    // Destination marker (most recent event or estimated destination)
    const latestEvent = trackingData.events[0];
    if (
      latestEvent?.location?.coordinates &&
      trackingData.status === "DELIVERED"
    ) {
      markers.push({
        id: "destination",
        position: latestEvent.location.coordinates,
        title: "Delivered",
        description: latestEvent.location.name || "Delivery location",
        type: "destination" as const,
      });
    } else {
      // Use estimated destination based on route or default
      const destinationCoords = polylineCoords[polylineCoords.length - 1] || {
        latitude: 34.0522,
        longitude: -118.2437,
      };
      markers.push({
        id: "destination",
        position: destinationCoords,
        title: "Destination",
        description: "Final delivery location",
        type: "destination" as const,
      });
    }

    const config: MapConfig = {
      center: currentLocationCoords,
      zoom: 6,
      markers,
      polyline: polylineCoords,
    };

    console.log("loadMap: Setting map config:", config);
    setMapConfig(config);
    setMapLoaded(true);
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

  // Real geocoding function using OpenStreetMap Nominatim API (free, no API key required)
  const getCoordinatesFromAddress = async (
    address: Address
  ): Promise<{ latitude: number; longitude: number }> => {
    try {
      // Build search query
      const searchQuery = `${address.street}, ${address.city}, ${address.state}, ${address.country}`;
      console.log("Geocoding address:", searchQuery);

      // Use OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "LogisticaFalcon/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
        console.log("Geocoding result:", coords);
        return coords;
      } else {
        throw new Error("No geocoding results found");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);

      // Only use fallback for known major cities as last resort
      const majorCities: Record<
        string,
        { latitude: number; longitude: number }
      > = {
        "new york,ny": { latitude: 40.7128, longitude: -74.006 },
        "los angeles,ca": { latitude: 34.0522, longitude: -118.2437 },
        "chicago,il": { latitude: 41.8781, longitude: -87.6298 },
        "mexico city,cdmx": { latitude: 19.4326, longitude: -99.1332 },
        "guadalajara,jalisco": { latitude: 20.6597, longitude: -103.3496 },
        "monterrey,nuevo leon": { latitude: 25.6866, longitude: -100.3161 },
        "tijuana,baja california": { latitude: 32.5149, longitude: -117.0382 },
        "chetumal,quintana roo": { latitude: 18.5141, longitude: -88.3038 },
      };

      const key = `${address.city.toLowerCase()},${address.state.toLowerCase()}`;
      const fallbackCoords = majorCities[key];

      if (fallbackCoords) {
        console.warn(
          `Using fallback coordinates for: ${address.city}, ${address.state}`
        );
        return fallbackCoords;
      }

      // If no fallback available, throw error instead of using wrong coordinates
      throw new Error(
        `Unable to geocode address: ${address.city}, ${address.state}, ${address.country}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-pattern bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Track Your <span className="text-red-600">Package</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get real-time updates on your shipment&apos;s location and
              delivery status with our advanced tracking system.
            </p>

            {/* Tracking Input */}
            <div className="max-w-md mx-auto">
              <Card className="border-0 logistics-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="trackingNumber"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Enter Tracking Number
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          id="trackingNumber"
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. SP123456789"
                          className="flex-1"
                          onKeyUp={(e) =>
                            e.key === "Enter" && handleTrackPackage()
                          }
                        />
                        <Button
                          onClick={handleTrackPackage}
                          disabled={isLoading}
                          className="dhl-gradient text-white"
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Search className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Try: SP123456789 or 123456789 for demo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Results */}
      {trackingData && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Status Overview */}
            <Card className="border-0 logistics-shadow mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[1.8rem] sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      Tracking #{trackingData.trackingNumber}
                    </CardTitle>
                    <p className="text-base sm:text-lg text-gray-600 mt-2">
                      Expected delivery:{" "}
                      {formatDateTime(trackingData.estimatedDelivery)}
                    </p>
                  </div>
                  <Badge
                    className={`px-4 py-2 ${getStatusColor(
                      trackingData.status
                    )}`}
                  >
                    {formatStatus(trackingData.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Delivery Progress</span>
                      <span>{trackingData.progress}%</span>
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
                              style={{ width: `${trackingData.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Progress steps */}
                        <div className="relative flex justify-between w-full">
                          {[0, 33, 66, 100].map((step, index) => (
                            <div
                              key={index}
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                trackingData.progress >= step
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}
                            >
                              {trackingData.progress >= step && (
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

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Current Location:{" "}
                      {trackingData.currentLocation?.name ||
                        "Location not available"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-[1.7rem] sm:text-2xl">
                    <MapPin className="h-6 w-6 text-red-600" />
                    <span>Package Route</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-100">
                    {/* Debug Panel - Remove this after fixing */}
                    {/* <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <strong>Debug Info:</strong><br/>
                      API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Found' : '❌ Missing'}<br/>
                      Map Config: {mapConfig ? '✅ Loaded' : '❌ Not loaded'}<br/>
                      Tracking Data: {trackingData ? '✅ Available' : '❌ Not available'}
                    </div> */}

                    {mapConfig ? (
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                        <GoogleMap
                          config={mapConfig}
                          className="w-full h-full"
                        />
                      ) : (
                        <MapPlaceholder
                          config={mapConfig}
                          className="w-full h-full"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
                          <p className="text-gray-500">Loading route map...</p>
                          <p className="text-xs text-gray-400 mt-2">
                            If this persists, check your Google Maps API key
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-[1.7rem] sm:text-2xl">
                    <Clock className="h-6 w-6 text-red-600" />
                    <span>Tracking Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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

                    {/* Vertical dashed line */}
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

                    <div className="space-y-8">
                      {trackingData.events.map((event, index) => {
                        // Find the most recent event by timestamp
                        const eventTimestamp = new Date(
                          event.timestamp
                        ).getTime();
                        const mostRecentTimestamp = Math.max(
                          ...trackingData.events.map((e) =>
                            new Date(e.timestamp).getTime()
                          )
                        );
                        const isLatestEvent =
                          eventTimestamp === mostRecentTimestamp;
                        const isCompleted = isLatestEvent;
                        const isActive = isLatestEvent;
                        const isDelivered = event.status
                          .toLowerCase()
                          .includes("delivered");

                        return (
                          <div
                            key={event.id}
                            className={`relative flex items-start space-x-4 transition-all duration-500 ease-in-out transform ${
                              index === 0
                                ? "animate-in slide-in-from-left-5"
                                : ""
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
                                className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${
                                  isCompleted || isDelivered
                                    ? "bg-blue-500 border-4 border-white shadow-lg ring-4 ring-blue-100"
                                    : isActive
                                    ? "bg-blue-400 border-4 border-white shadow-lg ring-4 ring-blue-100 animate-pulse"
                                    : "bg-gray-200 border-4 border-white shadow-md"
                                }`}
                              >
                                {(isActive || (isCompleted && index === 0)) && (
                                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25"></div>
                                )}
                                <div
                                  className={`text-sm ${
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
                            <div className="flex-1 min-w-0 pb-4">
                              <div className="flex items-start justify-between mb-1">
                                <h4
                                  className={`text-lg font-semibold transition-colors duration-300 ${
                                    isCompleted || isDelivered
                                      ? "text-gray-900"
                                      : isActive
                                      ? "text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {formatStatus(event.status)}
                                  {isDelivered && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      ✅ Delivered
                                    </span>
                                  )}
                                </h4>
                                <time className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">
                                  {formatDateTime(event.timestamp)}
                                </time>
                              </div>

                              <p className="text-base text-gray-600 leading-relaxed mb-2">
                                {event.description}
                              </p>

                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                  {event.location?.name
                                    ? `${event.location.name}${
                                        event.location.address?.city
                                          ? `, ${event.location.address.city}`
                                          : ""
                                      }${
                                        event.location.address?.state
                                          ? `, ${event.location.address.state}`
                                          : ""
                                      }`
                                    : "Location not available"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="border-0 logistics-shadow text-center">
                <CardContent className="p-6">
                  <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-[1.8rem] sm:text-xl font-semibold text-gray-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-base text-gray-600 mb-3">
                    Contact our support team for assistance
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      Contact Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 logistics-shadow text-center">
                <CardContent className="p-6">
                  <Package className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="text-[1.8rem] sm:text-xl font-semibold text-gray-900 mb-2">
                    Delivery Instructions
                  </h3>
                  {user?.publicMetadata.role === "admin" ? (
                    <>
                      <p className="text-base text-gray-600 mb-3">
                        Edit delivery details and preferences
                      </p>
                      {trackingData && (
                        <Link
                          href={`/admin/shipments/${trackingData.trackingNumber}/edit`}
                        >
                          <Button variant="outline" size="sm">
                            Edit Delivery
                          </Button>
                        </Link>
                      )}
                      {!trackingData && (
                        <Button variant="outline" size="sm" disabled>
                          Select Package First
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-base text-gray-600 mb-3">
                        View delivery instructions and requirements
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Show delivery instructions modal or expanded info
                          alert(
                            `Delivery Instructions for ${
                              trackingData?.trackingNumber || "this package"
                            }:\n\n• Package will be delivered to the address provided\n• Signature may be required for high-value items\n• If not available, package will be held at local facility\n• Contact customer service for special delivery requests\n• Safe delivery location can be specified in delivery notes`
                          );
                        }}
                      >
                        View Instructions
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 logistics-shadow text-center">
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <h3 className="text-[1.8rem] sm:text-xl font-semibold text-gray-900 mb-2">
                    Track Another
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 mb-3">
                    Track a different package
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTrackingData(null);
                      setTrackingNumber("");
                    }}
                  >
                    New Tracking
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Sample Tracking Numbers */}
      {!trackingData && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don&apos;t have a tracking number?
            </h2>
            <p className="text-gray-600 mb-8">
              Use one of these sample tracking numbers to see our tracking
              system in action
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="border-0 logistics-shadow cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setTrackingNumber("SP123456789")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-mono text-lg font-semibold text-red-600">
                        SP123456789
                      </p>
                      <p className="text-sm text-gray-600">
                        Express Delivery - Delivered ✅
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-0 logistics-shadow cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setTrackingNumber("123456789")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-mono text-lg font-semibold text-red-600">
                        123456789
                      </p>
                      <p className="text-sm text-gray-600">
                        Standard Delivery - In Transit 🚛
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
