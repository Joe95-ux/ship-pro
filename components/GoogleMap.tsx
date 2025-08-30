"use client";

import { useMemo, useState } from "react";
import {
  GoogleMap as GoogleMapComponent,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { MapConfig } from "@/lib/types";

interface GoogleMapProps {
  config: MapConfig;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function GoogleMap({ config, className = "", onMapLoad }: GoogleMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const mapCenter = useMemo(
    () => ({
      lat: config.center.latitude,
      lng: config.center.longitude,
    }),
    [config.center]
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    }),
    []
  );

  // Only show current location marker
  const currentLocationMarker = config.markers.find(marker => marker.type === 'current');

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className={`relative ${className}`} style={{ height: "100%", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
      <GoogleMapComponent
        center={mapCenter}
        zoom={config.zoom}
        options={mapOptions}
        onLoad={(map) => {
          onMapLoad?.(map);
        }}
        mapContainerStyle={{ height: "100%", width: "100%", borderRadius: "8px", overflow: "hidden" }}
      >
        {/* Only render current location marker */}
        {currentLocationMarker && (
          <>
            {/* Beeping animation circle */}
            <Marker
              position={{
                lat: currentLocationMarker.position.latitude,
                lng: currentLocationMarker.position.longitude,
              }}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#10B981" opacity="0.3">
                      <animate attributeName="r" values="32;48;32" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                `),
                scaledSize: new google.maps.Size(64, 64),
                anchor: new google.maps.Point(32, 32)
              }}
            />
            {/* Main parcel marker */}
            <Marker
              key={currentLocationMarker.id}
              position={{
                lat: currentLocationMarker.position.latitude,
                lng: currentLocationMarker.position.longitude,
              }}
              title={currentLocationMarker.title}
              onClick={() => setActiveMarker(currentLocationMarker.id)}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#10B981"/>
                    <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" fill="white"/>
                    <path d="M8 12L16 16L24 12" stroke="#10B981" stroke-width="1.5"/>
                    <path d="M16 16V24" stroke="#10B981" stroke-width="1.5"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
              }}
            >
              {activeMarker === currentLocationMarker.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div style={{ padding: "10px", maxWidth: "200px" }}>
                    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                      📦 {currentLocationMarker.title}
                    </h3>
                    {currentLocationMarker.description && (
                      <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
                        {currentLocationMarker.description}
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          </>
        )}
      </GoogleMapComponent>
    </div>
  );
}
