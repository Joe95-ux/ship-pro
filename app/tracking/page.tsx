"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Search, MapPin, Clock, Package, Truck, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import GoogleMap, { MapPlaceholder } from "@/components/GoogleMap";
import type { MapConfig } from "@/lib/types";

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
  estimatedDelivery: string;
  currentLocation: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  events: TrackingEvent[];
  progress: number;
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
    console.log('useEffect: trackingData changed:', trackingData);
    if (trackingData) {
      console.log('useEffect: Calling loadMap');
      loadMap();
      // Set a timeout to ensure map loads or shows placeholder
      const timeout = setTimeout(() => {
        if (!mapConfig) {
          console.log('useEffect: Timeout - calling loadMap again');
          loadMap();
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    } else {
      // Reset map config when no tracking data
      console.log('useEffect: Resetting map config');
      setMapConfig(null);
      setMapLoaded(false);
    }
  }, [trackingData]);

  // Sample tracking data for demonstration
  // Sample delivered package
  const deliveredTrackingData: TrackingData = {
    trackingNumber: "SP123456789",
    status: "DELIVERED",
    estimatedDelivery: "2024-01-15T17:00:00Z",
    currentLocation: {
      name: "Delivered - Los Angeles",
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    },
    events: [
      {
        id: "4",
        status: "Delivered",
        description: "Package has been delivered successfully and signed by recipient",
        location: {
          name: "Los Angeles Delivery Address",
          address: {
            city: "Los Angeles",
            state: "CA",
            country: "USA"
          },
          coordinates: {
            latitude: 34.0522,
            longitude: -118.2437
          }
        },
        timestamp: "2024-01-15T16:45:00Z"
      },
      {
        id: "3",
        status: "Out for delivery",
        description: "Package is out for delivery",
        location: {
          name: "Los Angeles Hub",
          address: {
            city: "Los Angeles",
            state: "CA",
            country: "USA"
          },
          coordinates: {
            latitude: 34.0522,
            longitude: -118.2437
          }
        },
        timestamp: "2024-01-15T08:00:00Z"
      },
      {
        id: "2",
        status: "In transit",
        description: "Package is in transit to destination",
        location: {
          name: "Chicago Distribution Center",
          address: {
            city: "Chicago",
            state: "IL",
            country: "USA"
          },
          coordinates: {
            latitude: 41.8781,
            longitude: -87.6298
          }
        },
        timestamp: "2024-01-13T14:30:00Z"
      },
      {
        id: "1",
        status: "Package picked up",
        description: "Package has been picked up from sender",
        location: {
          name: "New York Facility",
          address: {
            city: "New York",
            state: "NY",
            country: "USA"
          },
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        timestamp: "2024-01-12T09:00:00Z"
      }
    ],
    progress: 100
  };

  // Sample in-transit package
  const inTransitTrackingData: TrackingData = {
    trackingNumber: "123456789",
    status: "IN_TRANSIT",
    estimatedDelivery: "2024-01-18T17:00:00Z",
    currentLocation: {
      name: "Chicago Distribution Center",
      coordinates: {
        latitude: 41.8781,
        longitude: -87.6298
      }
    },
    events: [
      {
        id: "2",
        status: "In transit",
        description: "Package is in transit to destination",
        location: {
          name: "Chicago Distribution Center",
          address: {
            city: "Chicago",
            state: "IL",
            country: "USA"
          },
          coordinates: {
            latitude: 41.8781,
            longitude: -87.6298
          }
        },
        timestamp: "2024-01-16T14:30:00Z"
      },
      {
        id: "1",
        status: "Package picked up",
        description: "Package has been picked up from sender",
        location: {
          name: "Miami Facility",
          address: {
            city: "Miami",
            state: "FL",
            country: "USA"
          },
          coordinates: {
            latitude: 25.7617,
            longitude: -80.1918
          }
        },
        timestamp: "2024-01-15T09:00:00Z"
      }
    ],
    progress: 60
  };

  // Generate dynamic tracking data for any valid tracking number
  const generateDynamicTrackingData = (trackingNumber: string): TrackingData => {
    const statuses = ["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
    const cities = [
      { name: "New York", coords: { latitude: 40.7128, longitude: -74.0060 } },
      { name: "Chicago", coords: { latitude: 41.8781, longitude: -87.6298 } },
      { name: "Los Angeles", coords: { latitude: 34.0522, longitude: -118.2437 } },
      { name: "Miami", coords: { latitude: 25.7617, longitude: -80.1918 } },
      { name: "Denver", coords: { latitude: 39.7392, longitude: -104.9903 } }
    ];

    // Use tracking number to determine status (pseudo-random but consistent)
    const numberValue = parseInt(trackingNumber.replace(/\D/g, '')) || 0;
    const statusIndex = numberValue % statuses.length;
    const currentStatus = statuses[statusIndex];
    const cityIndex = numberValue % cities.length;
    const currentCity = cities[cityIndex];

    const progress = statusIndex * 25; // 0, 25, 50, 75, 100

    return {
      trackingNumber,
      status: currentStatus,
      estimatedDelivery: new Date(Date.now() + (5 - statusIndex) * 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: {
        name: `${currentCity.name} Distribution Center`,
        coordinates: currentCity.coords
      },
      events: [
        {
          id: "1",
          status: currentStatus === "DELIVERED" ? "Delivered" : currentStatus.replace('_', ' ').toLowerCase(),
          description: `Package is ${currentStatus.toLowerCase().replace('_', ' ')}`,
          location: {
            name: `${currentCity.name} Facility`,
            address: {
              city: currentCity.name,
              state: "State",
              country: "USA"
            },
            coordinates: currentCity.coords
          },
          timestamp: new Date().toISOString()
        },
        {
          id: "2",
          status: "Package picked up",
          description: "Package has been picked up from sender",
          location: {
            name: "Origin Facility",
            address: {
              city: "Origin City",
              state: "State",
              country: "USA"
            },
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      progress
    };
  };

  const handleTrackPackage = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to fetch real tracking data from API first
      try {
        const response = await fetch(`/api/tracking/${trackingNumber}`);
        if (response.ok) {
          const trackingApiData = await response.json();
          setTrackingData(trackingApiData);
          return;
        }
      } catch (error) {
        console.log('Failed to fetch from API, using demo data');
      }

      // For demo purposes, show specific sample data for exact matches or generate dynamic data
      const upperTrackingNumber = trackingNumber.toUpperCase();
      
      if (upperTrackingNumber === "SP123456789") {
        setTrackingData(deliveredTrackingData);
      } else if (trackingNumber === "123456789") {
        setTrackingData(inTransitTrackingData);
      } else if (upperTrackingNumber.startsWith("SP") && upperTrackingNumber.length >= 9) {
        // Generate dynamic tracking data for valid-looking SP tracking numbers
        const dynamicData = generateDynamicTrackingData(upperTrackingNumber);
        setTrackingData(dynamicData);
      } else {
        toast({
          title: "Not Found",
          description: "No package found with this tracking number. Try SP123456789 (delivered) or 123456789 (in transit)",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMap = () => {
    if (!trackingData) {
      console.log('loadMap: No tracking data available');
      return;
    }

    console.log('loadMap: Creating map config with tracking data:', trackingData);

    // Create map configuration based on tracking data
    const defaultCoords = { latitude: 40.7128, longitude: -74.0060 }; // New York default
    const currentLocationCoords = trackingData.currentLocation?.coordinates || defaultCoords;
    const currentLocationName = trackingData.currentLocation?.name || 'Unknown Location';

    const config: MapConfig = {
      center: currentLocationCoords,
      zoom: 6,
      markers: [
        {
          id: 'origin',
          position: trackingData.events[0]?.location?.coordinates || defaultCoords,
          title: 'Origin',
          description: 'Package pickup location',
          type: 'origin'
        },
        {
          id: 'current',
          position: currentLocationCoords,
          title: 'Current Location',
          description: currentLocationName,
          type: 'current'
        },
        {
          id: 'destination',
          position: { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles for demo
          title: 'Destination',
          description: 'Final delivery location',
          type: 'destination'
        }
      ],
      polyline: [
        { latitude: 40.7128, longitude: -74.0060 }, // New York
        { latitude: 41.8781, longitude: -87.6298 }, // Chicago
        { latitude: 34.0522, longitude: -118.2437 }  // Los Angeles
      ]
    };

    console.log('loadMap: Setting map config:', config);
    setMapConfig(config);
    setMapLoaded(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'picked_up':
      case 'package picked up':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'in_transit':
      case 'in transit':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case 'out_for_delivery':
      case 'out for delivery':
        return <MapPin className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              Get real-time updates on your shipment&apos;s location and delivery status with our advanced tracking system.
            </p>
            
            {/* Tracking Input */}
            <div className="max-w-md mx-auto">
              <Card className="border-0 logistics-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
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
                          onKeyPress={(e) => e.key === 'Enter' && handleTrackPackage()}
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
                      Expected delivery: {formatDateTime(trackingData.estimatedDelivery)}
                    </p>
                  </div>
                  <Badge className={`px-4 py-2 ${getStatusColor(trackingData.status)}`}>
                    {trackingData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Delivery Progress</span>
                      <span>{trackingData.progress}%</span>
                    </div>
                    <Progress value={trackingData.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Current Location: {trackingData.currentLocation?.name || 'Location not available'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-[1.8rem] sm:text-2xl">
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
                        <GoogleMap config={mapConfig} className="w-full h-full" />
                      ) : (
                        <MapPlaceholder config={mapConfig} className="w-full h-full" />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
                          <p className="text-gray-500">Loading route map...</p>
                          <p className="text-xs text-gray-400 mt-2">If this persists, check your Google Maps API key</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-[1.8rem] sm:text-2xl">
                    <Clock className="h-6 w-6 text-red-600" />
                    <span>Tracking Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trackingData.events.map((event, index) => {
                      const isCompleted = index === 0; // Most recent event is completed
                      const isActive = index === 0 && trackingData.status !== 'DELIVERED';
                      const isDelivered = trackingData.status === 'DELIVERED' && event.status.toLowerCase().includes('delivered');
                      
                      return (
                        <div 
                          key={event.id} 
                          className={`flex space-x-4 transition-all duration-500 ease-in-out transform ${
                            isCompleted || isDelivered ? 'animate-in slide-in-from-left-5' : 'opacity-70'
                          }`}
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                              isCompleted || isDelivered 
                                ? 'bg-green-500 border-2 border-green-500 shadow-lg shadow-green-200' 
                                : isActive 
                                ? 'bg-blue-500 border-2 border-blue-500 shadow-lg shadow-blue-200 animate-pulse' 
                                : 'bg-white border-2 border-gray-300'
                            }`}>
                              {(isCompleted || isDelivered) && (
                                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></div>
                              )}
                              <div className={`text-sm ${
                                isCompleted || isDelivered || isActive ? 'text-white' : 'text-gray-400'
                              }`}>
                                {getStatusIcon(event.status)}
                              </div>
                            </div>
                            {index < trackingData.events.length - 1 && (
                              <div className={`w-0.5 h-16 mt-3 transition-all duration-500 ${
                                isCompleted || isDelivered ? 'bg-green-300' : 'bg-gray-200'
                              }`}></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 ${
                                isCompleted || isDelivered ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                {event.status}
                                {isDelivered && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-bounce">
                                    ✅ Delivered
                                  </span>
                                )}
                              </h4>
                              <span className="text-sm text-gray-500 font-medium">
                                {formatDateTime(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">
                              {event.description}
                            </p>
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>
                                {event.location?.name 
                                  ? `${event.location.name}${event.location.address?.city ? `, ${event.location.address.city}` : ''}${event.location.address?.state ? `, ${event.location.address.state}` : ''}`
                                  : 'Location not available'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="border-0 logistics-shadow text-center">
                <CardContent className="p-6">
                  <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-[1.8rem] sm:text-xl font-semibold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-base text-gray-600 mb-3">Contact our support team for assistance</p>
                  <Link href="/contact">
                  <Button variant="outline" size="sm">Contact Support</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="border-0 logistics-shadow text-center">
                <CardContent className="p-6">
                  <Package className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="text-[1.8rem] sm:text-xl font-semibold text-gray-900 mb-2">Delivery Instructions</h3>
                  {user?.publicMetadata.role === 'admin' ? (
                    <>
                      <p className="text-base text-gray-600 mb-3">Edit delivery details and preferences</p>
                      {trackingData && (
                        <Link href={`/admin/shipments/${trackingData.trackingNumber}/edit`}>
                          <Button variant="outline" size="sm">Edit Delivery</Button>
                        </Link>
                      )}
                      {!trackingData && (
                        <Button variant="outline" size="sm" disabled>Select Package First</Button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-base text-gray-600 mb-3">View delivery instructions and requirements</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Show delivery instructions modal or expanded info
                          alert(`Delivery Instructions for ${trackingData?.trackingNumber || 'this package'}:\n\n• Package will be delivered to the address provided\n• Signature may be required for high-value items\n• If not available, package will be held at local facility\n• Contact customer service for special delivery requests\n• Safe delivery location can be specified in delivery notes`);
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
                  <h3 className="text-[1.8rem] sm:text-xl font-semibold text-gray-900 mb-2">Track Another</h3>
                  <p className="text-base sm:text-lg text-gray-600 mb-3">Track a different package</p>
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
              Use one of these sample tracking numbers to see our tracking system in action
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 logistics-shadow cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setTrackingNumber("SP123456789")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-mono text-lg font-semibold text-red-600">SP123456789</p>
                      <p className="text-sm text-gray-600">Express Delivery - Delivered ✅</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 logistics-shadow cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setTrackingNumber("123456789")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-mono text-lg font-semibold text-red-600">123456789</p>
                      <p className="text-sm text-gray-600">Standard Delivery - In Transit 🚛</p>
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
