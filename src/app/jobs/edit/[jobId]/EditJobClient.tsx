"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Script from "next/script";

export default function EditJobClient({ initialJob, session }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialJob?.title || "");
  const [description, setDescription] = useState(initialJob?.description || "");
  const [location, setLocation] = useState(initialJob?.location || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!session || session.user.userClass !== "Employer" || (initialJob && initialJob.employerId !== session.user.id)) {
      router.push("/jobs");
    }
    if (!initialJob) setError("Job not found");
  }, [session, initialJob, router]);

  const initAutocomplete = () => {
    if (window.google && autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ["address"],
        fields: ["formatted_address"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) setLocation(place.formatted_address);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const jobData = { title, description, location };

    const response = await fetch(`/api/jobs/${initialJob.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });

    if (response.ok) {
      setSuccess("Job updated successfully!");
      setTimeout(() => router.push("/jobs"), 1000);
    } else {
      setError("Failed to update job");
    }
  };

  if (!session || !initialJob) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Edit Job" />
        <div className="flex flex-col gap-10">
          <p>{error || "Loading..."}</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <>
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA8Kd0-RN8DRm0l5hxelpsSiHY9eZz-0V0&libraries=places"
        onLoad={initAutocomplete}
      />
      <DefaultLayout>
        <div className="mx-auto max-w-270">
          <Breadcrumb pageName="Edit Job" />
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-5">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">Job Details</h3>
                </div>
                <div className="p-7">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-5.5">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="title">
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
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="description">
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
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="location">
                        Location
                      </label>
                      <input
                        ref={autocompleteRef}
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="location"
                        id="location"
                        placeholder="Enter job location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}