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
  singleJobZoom?: boolean; // New prop for single job view
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const JobsMap: React.FC<JobsMapProps> = ({ jobs, fullScreen = false, singleJobZoom = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const [scriptError, setScriptError] = useState(false);

  // Check if Google Maps script is already loaded
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
      existingScript.addEventListener('error', () => setScriptError(true));
      return;
    }

    // Load Google Maps script with minimal libraries for speed
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async`;
    script.async = true;
    script.defer = true;
    
    // Add timeout for script loading
    const timeoutId = setTimeout(() => {
      setScriptError(true);
    }, 15000); // 15 second timeout
    
    script.onload = () => {
      clearTimeout(timeoutId);
      setMapLoaded(true);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      setScriptError(true);
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Initialize map quickly
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || map) return;

    const initMap = () => {
      const mapOptions = {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: singleJobZoom ? 15 : 10, // Higher zoom for single job view
        mapTypeId: "roadmap",
        disableDefaultUI: singleJobZoom ? true : false, // Minimal UI for single job
        zoomControl: !singleJobZoom,
        streetViewControl: false,
        fullscreenControl: fullScreen && !singleJobZoom,
        mapTypeControl: false,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          // Enhanced styling for single job view
          ...(singleJobZoom ? [
            {
              featureType: "road",
              elementType: "labels",
              stylers: [{ visibility: "simplified" }],
            },
            {
              featureType: "administrative",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            }
          ] : [])
        ],
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    };

    initMap();
  }, [mapLoaded, map, fullScreen, singleJobZoom]);

  // Add markers efficiently
  useEffect(() => {
    if (!map || !jobs.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoords = false;

    // Batch marker creation for better performance
    const markers = jobs.map((job, index) => {
      // Use consistent mock coordinates
      const seedLat = 40.7128 + (((job.id * 123) % 200) - 100) * 0.001;
      const seedLng = -74.0060 + (((job.id * 456) % 200) - 100) * 0.001;
      
      const lat = job.lat || seedLat;
      const lng = job.lng || seedLng;
      const position = { lat, lng };
      
      bounds.extend(position);
      hasValidCoords = true;

      // Enhanced marker for single job view
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: job.title,
        optimized: true,
        animation: singleJobZoom ? window.google.maps.Animation.DROP : null,
        icon: singleJobZoom ? {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2C12.8 2 7 7.8 7 15C7 25 20 38 20 38C20 38 33 25 33 15C33 7.8 27.2 2 20 2Z" fill="#DC2626" stroke="#B91C1C" stroke-width="2"/>
              <circle cx="20" cy="15" r="6" fill="white"/>
              <circle cx="20" cy="15" r="3" fill="#DC2626"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40),
        } : undefined,
      });

      return marker;
    });

    // Add click listeners after all markers are created
    markers.forEach((marker, index) => {
      const job = jobs[index];
      marker.addListener("click", () => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px; font-family: Arial, sans-serif;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${job.title}</h4>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 4px;">
                <span style="color: #dc2626;">📍</span> ${job.location}
              </p>
              ${singleJobZoom ? '' : `
                <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.4; color: #4b5563;">
                  ${job.description.substring(0, 80)}${job.description.length > 80 ? '...' : ''}
                </p>
                <a href="/jobs/${job.id}" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 600;">
                  View Details →
                </a>
              `}
            </div>
          `,
        });
        infoWindow.open(map, marker);
      });
    });

    markersRef.current = markers;

    // Fit bounds with appropriate zoom for single job
    if (hasValidCoords) {
      requestAnimationFrame(() => {
        if (singleJobZoom && jobs.length === 1) {
          // Center on single job with fixed zoom
          map.setCenter(bounds.getCenter());
          map.setZoom(16);
        } else if (jobs.length > 1) {
          map.fitBounds(bounds);
        } else {
          map.setCenter(bounds.getCenter());
          map.setZoom(12);
        }
      });
    }
  }, [map, jobs, singleJobZoom]);

  if (scriptError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 rounded">
        <div className="text-center p-6">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Map Failed to Load</h3>
          <p className="text-sm text-red-600">Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${fullScreen ? 'min-h-screen' : singleJobZoom ? 'min-h-96' : 'min-h-[320px]'}`}
    />
  );
};

export default JobsMap;