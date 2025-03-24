"use client";

import { useState } from "react";
import Link from "next/link";

const JobDropdown = ({ jobId }: { jobId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none"
      >
        ⋮
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md z-10">
          <Link
            href={`/jobs/edit/${jobId}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white"
          >
            Edit
          </Link>
          <Link
            href={`/my-jobs?delete=${jobId}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white"
          >
            Delete
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobDropdown;