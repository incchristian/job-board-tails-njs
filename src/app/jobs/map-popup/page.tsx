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

export default function MapPopup() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [jobs, setJobs] = useState<JobWithCoords[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    // Retrieve jobs from sessionStorage
    const storedJobs = sessionStorage.getItem("jobsForMap");
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
  }, []);

  const loadGoogleMapsScript = () => {
    if (window.google) {
      console.log("Google Maps API already loaded, initializing map...");
      initMap();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps API script loaded successfully");
      initMap();
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps API script");
      setMapLoaded(false);
    };
    document.head.appendChild(script);
  };

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
    loadGoogleMapsScript();
  }, [jobs]); // Re-run if jobs change

  return (
    <div className="relative h-screen w-screen">
      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Loading Animation */}
      {!mapLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10"
        >
          <div
            className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
          />
        </div>
      )}
    </div>
  );
}