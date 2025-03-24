"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";

export default function JobsMap({ jobs }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const initMap = () => {
    if (window.google && mapRef.current && jobs.length > 0) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: 37.0902, lng: -95.7129 }, // Default US center
      });

      jobs.forEach((job) => {
        if (job.lat && job.lng) {
          new window.google.maps.Marker({
            position: { lat: job.lat, lng: job.lng },
            map,
            title: job.title,
          });
        }
      });
      setMapLoaded(true);
    }
  };

  useEffect(() => {
    if (window.google && jobs.length > 0) initMap();
  }, [jobs]);

  return (
    <>
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA8Kd0-RN8DRm0l5hxelpsSiHY9eZz-0V0"
        onLoad={initMap}
      />
      <div style={{ height: "400px", width: "100%" }} ref={mapRef} />
      {!mapLoaded && <p>Loading map...</p>}
    </>
  );
}