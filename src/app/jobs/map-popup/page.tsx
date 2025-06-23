"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import HireRecruiterModal from "@/components/HireRecruiterModal";
import Link from "next/link";
import JobsMap from "../JobsMap";

interface JobWithCoords {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  employerId: number;  // Changed from postedBy to employerId
  logoPath: string | null;
  lat: number;
  lng: number;
  country: string | null;
  state: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
}

export default function JobsMapPopupPage() {
  const { data: session } = useSession();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [jobs, setJobs] = useState<JobWithCoords[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithCoords | null>(null);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Retrieve jobs from sessionStorage
    const storedJobs = sessionStorage.getItem("jobsForMap");
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
  }, []);

  useEffect(() => {
    if (session?.user?.userClass === 'employer') {
      fetchRecruiters();
    }
  }, [session]);

  const fetchRecruiters = async () => {
    try {
      const response = await fetch('/api/users?userClass=recruiter');
      if (response.ok) {
        const data = await response.json();
        setRecruiters(data.users);
      }
    } catch (error) {
      console.error('Error fetching recruiters:', error);
    }
  };

  const handleHireRecruiter = (job: JobWithCoords) => {
    setSelectedJob(job);
    setShowHireModal(true);
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  };

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
      mapId: "job-map",
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
            const isOwner = session?.user?.userClass === 'employer' && job.employerId === session.user.id;
            const isCandidate = session?.user?.userClass === 'candidate';
            
            const content = `
              <div style="max-width: 320px; padding: 12px;">
                <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #1f2937;">${job.title}</h3>
                <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280; line-height: 1.4;">${job.description || "No description available"}</p>
                <p style="margin: 0 0 12px; font-size: 14px; color: #374151;">📍 ${job.location || "N/A"}</p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <a href="/jobs/${job.id}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 500;">
                    View Details
                  </a>
                  ${isOwner ? `
                    <button onclick="window.hireRecruiterFromMapPopup(${job.id})" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
                      Hire Recruiter
                    </button>
                  ` : ''}
                  ${isCandidate ? `
                    <button style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">
                      Apply Now
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, marker);
          }
        });

        markerCount++;
      }
    });

    // Make hire function globally available for map popup
    (window as any).hireRecruiterFromMapPopup = (jobId: number) => {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        handleHireRecruiter(job);
      }
    };

    console.log(`Map initialized with ${markerCount} markers`);
    setMapLoaded(true);
  };

  useEffect(() => {
    loadGoogleMapsScript();
  }, [jobs]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Add a timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch("/api/jobs", {
          signal: controller.signal,
          cache: 'force-cache' // Use cached data if available
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const jobsData = await response.json();
          setJobs(jobsData);
        } else {
          setError("Failed to load jobs");
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setError("Request timed out. Please try again.");
        } else {
          setError("Failed to load jobs");
        }
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };

    // Start loading immediately
    fetchJobs();
  }, []);

  const closeWindow = () => {
    window.close();
  };

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={closeWindow}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading jobs map...</p>
          <p className="text-sm text-gray-400 mt-2">This should only take a few seconds</p>
          <button
            onClick={closeWindow}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative bg-white">
      {/* Header bar for popup */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-800">Jobs Map</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {jobs.length} jobs
          </span>
        </div>
        <button
          onClick={closeWindow}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
      </div>

      {/* Full-screen map */}
      <div className="h-full w-full pt-12">
        <JobsMap jobs={jobs} fullScreen={true} />
      </div>
    </div>
  );
}