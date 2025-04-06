// src/app/jobs/all/page.tsx (partial update)
export default async function JobPostsPage() {
  const jobs = await fetchAllJobs();

  const jobsForMap = jobs.filter(
    (job): job is JobWithCoords & { lat: number; lng: number } =>
      job.lat !== null && typeof job.lat === "number" && !isNaN(job.lat) &&
      job.lng !== null && typeof job.lng === "number" && !isNaN(job.lng)
  );

  console.log(`Rendering map with ${jobsForMap.length} valid job locations:`, jobsForMap);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="All Jobs" />
      <div className="mb-10 h-[400px] w-full rounded-sm border border-stroke bg-white p-1 shadow-default dark:border-strokedark dark:bg-boxdark sm:h-[500px]">
        {jobsForMap.length > 0 ? (
          <JobMap jobs={jobsForMap} />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-boxdark-2">
            <p className="text-gray-500 dark:text-gray-400">No job locations to display on the map.</p>
          </div>
        )}
      </div>
      {/* Rest of the code remains unchanged */}
    </DefaultLayout>
  );
}