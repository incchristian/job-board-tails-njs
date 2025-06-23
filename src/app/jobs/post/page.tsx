"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";

const PostJobPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Enhanced autocomplete setup with better loading detection
  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places && autocompleteRef.current) {
        console.log("Initializing Google Places Autocomplete...");
        
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          types: ["address"],
          componentRestrictions: { country: ["ca", "us"] },
          fields: ["address_components", "geometry", "formatted_address", "place_id"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          
          console.log("Place selected:", place);
          
          if (!place.geometry || !place.geometry.location) {
            setError("Please select a valid address from the dropdown suggestions");
            return;
          }

          // Extract detailed address components
          let streetNumber = "";
          let route = "";
          let locality = "";
          let adminAreaLevel1 = "";
          let countryName = "";
          let postalCodeValue = "";

          place.address_components?.forEach((component) => {
            const types = component.types;
            
            if (types.includes("street_number")) {
              streetNumber = component.long_name;
            }
            if (types.includes("route")) {
              route = component.long_name;
            }
            if (types.includes("locality")) {
              locality = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
              adminAreaLevel1 = component.long_name;
            }
            if (types.includes("country")) {
              countryName = component.long_name;
            }
            if (types.includes("postal_code")) {
              postalCodeValue = component.long_name;
            }
          });

          // Construct full street address
          const fullStreet = `${streetNumber} ${route}`.trim();
          
          // Update all form fields
          setStreet(fullStreet || place.formatted_address);
          setCity(locality);
          setState(adminAreaLevel1);
          setCountry(countryName);
          setPostalCode(postalCodeValue);
          
          // Set coordinates for accurate map placement
          const latitude = place.geometry.location.lat();
          const longitude = place.geometry.location.lng();
          setLat(latitude);
          setLng(longitude);
          
          console.log("Autocomplete result:", {
            street: fullStreet,
            city: locality,
            state: adminAreaLevel1,
            country: countryName,
            postalCode: postalCodeValue,
            coordinates: { lat: latitude, lng: longitude }
          });
          
          // Clear any previous errors
          setError("");
        });
        
        console.log("Google Places Autocomplete initialized successfully");
      } else {
        console.log("Google Maps API not ready yet...");
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
    } else {
      // Wait for Google Maps to load with longer intervals and timeout
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds total
      
      const checkGoogle = setInterval(() => {
        attempts++;
        console.log(`Checking for Google Maps API... Attempt ${attempts}`);
        
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log("Google Maps API loaded!");
          initAutocomplete();
          clearInterval(checkGoogle);
        } else if (attempts >= maxAttempts) {
          console.error("Google Maps API failed to load after 10 seconds");
          setError("Google Maps failed to load. Please refresh the page.");
          clearInterval(checkGoogle);
        }
      }, 200);
      
      return () => clearInterval(checkGoogle);
    }
  }, []);

  // Map preview when coordinates are available
  useEffect(() => {
    if (lat && lng && window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat, lng },
      });
      
      // Use regular Marker instead of AdvancedMarkerElement
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Job Location",
      });
    }
  }, [lat, lng]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateLocation = () => {
    if (!street || !city || !state || !country) {
      setError("Please use the address autocomplete to fill all location fields");
      return false;
    }
    
    if (!lat || !lng) {
      setError("Please select a valid address from the autocomplete suggestions to get coordinates");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (!validateLocation()) {
      setSubmitting(false);
      return;
    }

    try {
      // Create location string from filled fields
      const location = `${street}, ${city}, ${state}, ${country}${postalCode ? " " + postalCode : ""}`;

      // Handle logo upload (optional)
      let logoUrl = "";
      if (logo) {
        try {
          const formData = new FormData();
          formData.append("file", logo);
          formData.append("upload_preset", "job_logos");
          
          const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
          );
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            logoUrl = uploadData.secure_url || "";
          }
        } catch (logoError) {
          console.warn("Logo upload failed, continuing without logo:", logoError);
        }
      }

      // Prepare job data with coordinates from autocomplete
      const jobData = {
        title,
        description,
        location,
        employerId: session?.user?.id,
        logoPath: logoUrl || null,
        lat,
        lng,
        country,
        state,
        street,
        city,
        postalCode,
      };

      console.log("Submitting job data:", jobData);

      // Submit job
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        setSuccess("Job posted successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setCountry("");
        setState("");
        setCity("");
        setStreet("");
        setPostalCode("");
        setLat(null);
        setLng(null);
        setLogo(null);
        setPreviewUrl("");
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/my-jobs");
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(`Failed to post job: ${errorData.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Error posting job:", err);
      setError(`An error occurred: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      </DefaultLayout>
    );
  }

  if (status === "unauthenticated" || session?.user?.userClass !== "Employer") {
    router.push("/jobs");
    return null;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Post a Job" />
        
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Job Details</h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="title">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Enter job title (e.g., Senior Software Developer)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="description">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      name="description"
                      id="description"
                      rows={6}
                      placeholder="Enter detailed job description, responsibilities, and requirements..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="address">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={autocompleteRef}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="address"
                        id="address"
                        placeholder="Start typing an address and select from suggestions..."
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        📍 Select from dropdown
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Type your address and select from the dropdown to auto-fill location details
                    </p>
                  </div>

                  {/* Auto-populated fields */}
                  <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        City
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Auto-filled from address"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        State/Province
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Auto-filled from address"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2 mt-5.5">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Country
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Auto-filled from address"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Postal/ZIP Code
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Auto-filled from address"
                      />
                    </div>
                  </div>

                  {/* Map preview */}
                  {lat && lng && (
                    <div className="mt-5.5">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Location Preview
                      </label>
                      <div ref={mapRef} className="h-48 w-full rounded border border-stroke" />
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                      {success}
                    </div>
                  )}

                  <div className="flex justify-end gap-4.5 mt-6">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => router.push("/jobs")}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Posting..." : "Post Job"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Logo upload section remains the same */}
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Company Logo (Optional)</h3>
              </div>
              <div className="p-7">
                <div className="mb-4 flex items-center gap-3">
                  {previewUrl ? (
                    <Image src={previewUrl} width={112} height={112} alt="Job Logo" className="rounded" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-2 dark:bg-meta-4 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z" fill="#3C50E0" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z" fill="#3C50E0" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z" fill="#3C50E0" />
                      </svg>
                    </span>
                    <p><span className="text-primary">Upload Company Logo</span></p>
                    <p className="mt-1.5 text-xs">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PostJobPage;