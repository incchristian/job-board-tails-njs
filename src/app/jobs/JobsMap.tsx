"use client";

import { useEffect, useRef, useState } from "react";

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
}

interface JobsMapProps {
  jobs: Job[];
  fullScreen?: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const JobsMap: React.FC<JobsMapProps> = ({ jobs, fullScreen = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Check if Google Maps script is already loaded
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      setScriptLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setMapLoaded(true);
        setScriptLoaded(true);
      });
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setMapLoaded(true);
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };

    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || map) return;

    const initMap = () => {
      const mapOptions = {
        center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
        zoom: 10,
        mapTypeId: "roadmap",
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
        ],
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    };

    if (window.google && window.google.maps) {
      initMap();
    }
  }, [mapLoaded, map]);

  // Add markers when jobs change (optimized)
  useEffect(() => {
    if (!map || !jobs.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Get bounds for auto-fitting
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoords = false;

    jobs.forEach((job, index) => {
      // Mock coordinates if not provided (use consistent seeded random)
      const seedLat = 40.7128 + (((job.id * 123) % 100) - 50) * 0.002;
      const seedLng = -74.006 + (((job.id * 456) % 100) - 50) * 0.002;

      const lat = job.lat || seedLat;
      const lng = job.lng || seedLng;

      const position = { lat, lng };
      bounds.extend(position);
      hasValidCoords = true;

      // Create simple marker for better performance
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: job.title,
        optimized: true, // Better performance
      });

      // Add click listener with simple info window
      marker.addListener("click", () => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px; font-family: Arial, sans-serif;">
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${job.title}</h4>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">📍 ${job.location}</p>
              <a href="/jobs/${job.id}" style="color: #3B82F6; text-decoration: none; font-size: 12px;">View Details →</a>
            </div>
          `,
        });
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit map to markers with slight delay for better UX
    if (hasValidCoords) {
      setTimeout(() => {
        if (jobs.length > 1) {
          map.fitBounds(bounds);
        } else {
          map.setCenter(bounds.getCenter());
          map.setZoom(12);
        }
      }, 100);
    }
  }, [map, jobs]);

  return (
    <div className="relative w-full h-full">
      {!scriptLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-bodydark2">Loading map...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className={`w-full h-full ${fullScreen ? "min-h-screen" : "min-h-[320px]"}`}
        style={{ opacity: scriptLoaded ? 1 : 0.3 }}
      />
    </div>
  );
};

export default JobsMap;