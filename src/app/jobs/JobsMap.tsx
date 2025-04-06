"use client";

import { useState, useEffect, useRef } from "react";

interface JobWithCoords {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  employerId: number;
  logoPath: string | null;
  lat: number;
  lng: number;
  country: string | null;
  state: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
}

interface JobsMapProps {
  jobs: JobWithCoords[];
}

export default function JobsMap({ jobs }: JobsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  console.log("JobsMap component rendered with jobs:", jobs);

  const initMap = () => {
    if (!window.google || !mapRef.current) {
      console.error("Cannot initialize map:", {
        google: !!window.google,
        mapRef: !!mapRef.current,
      });
      return;
    }

    const firstValidJob = jobs.find(
      (job) => job.lat !== null && job.lng !== null && !isNaN(job.lat) && !isNaN(job.lng)
    );
    const defaultCenter = firstValidJob
      ? { lat: firstValidJob.lat, lng: firstValidJob.lng }
      : { lat: 45.5017, lng: -73.5673 }; // Montreal fallback

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: firstValidJob ? 12 : 4,
      center: defaultCenter,
      mapId: "job-map", // Replace with your actual Map ID from Google Cloud Console
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();

    let markerCount = 0;
    jobs.forEach((job) => {
      if (job.lat !== null && job.lng !== null && !isNaN(job.lat) && !isNaN(job.lng)) {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: job.lat, lng: job.lng },
          map,
          title: job.title,
        });

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            const content = `
              <div style="max-width: 300px; padding: 10px;">
                <h3 style="margin: 0 0 5px; font-size: 16px; font-weight: bold;">${job.title}</h3>
                <p style="margin: 0 0 5px; font-size: 14px;">${job.description || "No description available"}</p>
                <p style="margin: 0; font-size: 14px; color: #555;">Location: ${job.location || "N/A"}</p>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, marker);
          }
        });

        markerCount++;
      }
    });

    console.log(`Map initialized with ${markerCount} markers`);
    setMapLoaded(true);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkGoogleMaps = () => {
      if (window.google) {
        console.log("Google Maps API detected, initializing map...");
        initMap();
        clearInterval(intervalId);
      } else {
        console.log("Google Maps API not yet loaded, checking again...");
      }
    };

    if (!mapLoaded) {
      if (window.google) {
        initMap();
      } else {
        intervalId = setInterval(checkGoogleMaps, 100); // Check every 100ms
      }
    }

    // Cleanup interval on unmount or when map loads
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobs, mapLoaded]);

  return (
    <div style={{ position: "relative", height: "400px", width: "100%" }}>
      {/* Map Container */}
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

      {/* Loading Animation */}
      {!mapLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}