"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function EditJobClient({ initialJob, session }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialJob?.title || "");
  const [description, setDescription] = useState(initialJob?.description || "");
  const [address, setAddress] = useState(
    `${initialJob?.street || ""}, ${initialJob?.city || ""}, ${initialJob?.state || ""}, ${initialJob?.country || ""}`
  );
  const [street, setStreet] = useState(initialJob?.street || "");
  const [city, setCity] = useState(initialJob?.city || "");
  const [state, setState] = useState(initialJob?.state || "");
  const [country, setCountry] = useState(initialJob?.country || "");
  const [postalCode, setPostalCode] = useState(initialJob?.postalCode || "");
  const [lat, setLat] = useState(initialJob?.lat || null);
  const [lng, setLng] = useState(initialJob?.lng || null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const autocompleteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) {
      setError("Please log in to edit jobs");
      return;
    }
    if (session.user.userClass !== "Employer") {
      setError("Only employers can edit jobs");
      return;
    }
    if (initialJob && String(initialJob.employerId) !== String(session.user.id)) {
      setError("You can only edit your own jobs");
      setTimeout(() => router.push("/jobs"), 3000);
      return;
    }
    if (!initialJob) {
      setError("Job not found");
    }
  }, [session, initialJob, router]);

  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && autocompleteRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
          types: ["address"],
          componentRestrictions: { country: ["ca", "us"] },
          fields: ["address_components", "geometry", "formatted_address"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) {
            setError("Please select a valid address from the suggestions");
            return;
          }

          let newStreet = "";
          let newCity = "";
          let newState = "";
          let newCountry = "";
          let newPostalCode = "";

          place.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes("street_number") || types.includes("route")) {
              newStreet += (newStreet ? " " : "") + component.long_name;
            }
            if (types.includes("locality")) {
              newCity = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
              newState = component.long_name;
            }
            if (types.includes("country")) {
              newCountry = component.long_name;
            }
            if (types.includes("postal_code")) {
              newPostalCode = component.long_name;
            }
          });

          setAddress(place.formatted_address);
          setStreet(newStreet);
          setCity(newCity);
          setState(newState);
          setCountry(newCountry);
          setPostalCode(newPostalCode);
          setLat(place.geometry.location.lat());
          setLng(place.geometry.location.lng());
        });
      }
    };

    if (window.google) {
      initAutocomplete();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initAutocomplete();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!lat || !lng) {
      setError("Please select a valid address to geocode the location");
      return;
    }

    const jobData = {
      title,
      description,
      street,
      city,
      state,
      country,
      postalCode,
      lat,
      lng,
      location: `${street}, ${city}, ${state}, ${country}${postalCode ? " " + postalCode : ""}`,
    };

    try {
      const response = await fetch(`/api/jobs/${initialJob?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        setSuccess("Job updated successfully!");
        setTimeout(() => router.push("/jobs"), 1000);
      } else {
        const errorData = await response.json();
        setError(`Failed to update job: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Failed to update job: ${err.message}`);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Edit Job" />
        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5">
            {error ? (
              <div className="p-7">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : (
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">Job Details</h3>
                </div>
                <div className="p-7">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="title"
                      >
                        Job Title
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="title"
                        id="title"
                        placeholder="Enter job title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="description"
                      >
                        Description
                      </label>
                      <textarea
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="description"
                        id="description"
                        rows={6}
                        placeholder="Enter job description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="address"
                      >
                        Full Address
                      </label>
                      <input
                        ref={autocompleteRef}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="address"
                        id="address"
                        placeholder="Enter full address (e.g., 123 Main St, Toronto, ON, Canada)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {success && <p className="text-green-500 mb-4">{success}</p>}

                    <div className="flex justify-end gap-4.5">
                      <button
                        className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                        type="button"
                        onClick={() => router.push("/jobs")}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                        type="submit"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}