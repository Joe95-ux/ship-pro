"use client";

import L from "leaflet";
import { MapPin } from "lucide-react";
import ReactDOMServer from "react-dom/server";

// Function that creates a Leaflet DivIcon using Lucide MapPin
export const createMapPinIcon = (color: string) =>
  new L.DivIcon({
    className: "custom-marker-icon",
    html: ReactDOMServer.renderToString(
      <MapPin size={28} color={color} strokeWidth={2.5} />
    ),
    iconSize: [28, 28],
    iconAnchor: [14, 28], // center bottom
    popupAnchor: [0, -28],
});
