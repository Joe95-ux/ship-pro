"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import type { MapConfig, MapMarker } from '@/lib/types';

interface GoogleMapProps {
  config: MapConfig;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function GoogleMap({ config, className = "", onMapLoad }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Google Maps loader
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: "weekly",
          libraries: ["maps", "marker"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        if (!mapRef.current) return;

        // Create map
        const mapInstance = new Map(mapRef.current, {
          center: config.center,
          zoom: config.zoom,
          mapId: "shipping-route-map",
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        });

        setMap(mapInstance);

        // Add markers
        config.markers.forEach((markerConfig) => {
          const markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.innerHTML = getMarkerHTML(markerConfig);

          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: markerConfig.position,
            content: markerElement,
            title: markerConfig.title
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${markerConfig.title}</h3>
                ${markerConfig.description ? `<p style="margin: 0; font-size: 12px; color: #666;">${markerConfig.description}</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
        });

        // Add polyline for route
        if (config.polyline && config.polyline.length > 1) {
          new google.maps.Polyline({
            path: config.polyline,
            geodesic: true,
            strokeColor: '#D40511',
            strokeOpacity: 1.0,
            strokeWeight: 3,
            map: mapInstance
          });
        }

        // Fit bounds to show all markers
        if (config.markers.length > 1) {
          const bounds = new google.maps.LatLngBounds();
          config.markers.forEach(marker => {
            bounds.extend(marker.position);
          });
          mapInstance.fitBounds(bounds);
        }

        onMapLoad?.(mapInstance);
        setIsLoading(false);

      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your Google Maps API key.');
        setIsLoading(false);
      }
    };

    initMap();
  }, [config, onMapLoad]);

  const getMarkerHTML = (marker: MapMarker) => {
    const colors = {
      origin: '#10B981',      // Green
      destination: '#EF4444', // Red
      current: '#F59E0B',     // Yellow
      waypoint: '#6B7280'     // Gray
    };

    const color = colors[marker.type] || colors.waypoint;

    return `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
      ">
        ${marker.type === 'current' ? `
          <div style="
            width: 16px;
            height: 16px;
            background-color: ${color};
            border-radius: 50%;
            position: absolute;
            top: 1px;
            left: 1px;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `;
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={`w-full h-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
      />
    </div>
  );
}

// Alternative component for when Google Maps is not available
export function MapPlaceholder({ config, className = "" }: { config: MapConfig; className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center p-8">
        <div className="relative w-full max-w-md mx-auto mb-4">
          {/* Simple route visualization */}
          <div className="flex items-center justify-between">
            {config.markers.map((marker, index) => (
              <div key={marker.id} className="flex flex-col items-center">
                <div 
                  className={`w-4 h-4 rounded-full mb-2 ${
                    marker.type === 'origin' ? 'bg-green-500' :
                    marker.type === 'destination' ? 'bg-red-500' :
                    marker.type === 'current' ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-400'
                  }`}
                />
                <span className="text-xs text-gray-600 text-center max-w-20 truncate">
                  {marker.title}
                </span>
              </div>
            ))}
          </div>
          {/* Route line */}
          {config.markers.length > 1 && (
            <div className="absolute top-2 left-2 right-2 h-0.5 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
          )}
        </div>
        <p className="text-gray-500 text-sm">
          Interactive map will be available with Google Maps API key
        </p>
      </div>
    </div>
  );
}
