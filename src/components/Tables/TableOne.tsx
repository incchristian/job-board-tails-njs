import Image from "next/image";

const TableOne = ({ jobs = [], onEdit, onDelete }) => { // Add onEdit and onDelete with defaults
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        My Job Posts
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Logo</h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Title</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Description</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Location</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
          </div>
        </div>

        {jobs.length === 0 ? (
          <p className="p-2.5 text-center">No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div
              className="grid grid-cols-4 border-b border-stroke dark:border-strokedark sm:grid-cols-5"
              key={job.id}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                {job.logoPath ? (
                  <Image src={job.logoPath} width={32} height={32} alt="Job Logo" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-2 dark:bg-meta-4"></div>
                )}
              </div>
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{job.title}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{job.description}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{job.location}</p>
              </div>
              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5 gap-2">
                <button
                  onClick={() => onEdit(job.id)} // Call onEdit with job.id
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => onDelete(job.id)} // Call onDelete with job.id
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TableOne;