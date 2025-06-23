"use client";
import { useState } from 'react';
import Image from 'next/image';

interface Recruiter {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  company?: string;
}

interface HireRecruiterModalProps {
  jobId: number;
  jobTitle: string;
  recruiters: Recruiter[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function HireRecruiterModal({ 
  jobId, 
  jobTitle, 
  recruiters, 
  onClose, 
  onSuccess 
}: HireRecruiterModalProps) {
  const [selectedRecruiter, setSelectedRecruiter] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedRecruiter) return;

    setLoading(true);
    try {
      const response = await fetch('/api/job-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          recruiterId: selectedRecruiter,
          message
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to hire recruiter');
      }
    } catch (error) {
      console.error('Error hiring recruiter:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Hire Recruiter for: {jobTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {recruiters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recruiters available.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Select a recruiter:
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {recruiters.map((recruiter) => (
                  <div
                    key={recruiter.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedRecruiter === recruiter.id
                        ? 'border-primary bg-primary/10'
                        : 'border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedRecruiter(recruiter.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={recruiter.profilePicture || '/images/user/user-06.png'}
                        alt={recruiter.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-black dark:text-white">
                          {recruiter.name}
                        </h4>
                        <p className="text-sm text-gray-500">{recruiter.email}</p>
                        {recruiter.company && (
                          <p className="text-sm text-gray-600">{recruiter.company}</p>
                        )}
                        {recruiter.bio && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {recruiter.bio}
                          </p>
                        )}
                      </div>
                      {selectedRecruiter === recruiter.id && (
                        <div className="text-primary">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Message (optional):
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-stroke dark:border-strokedark rounded-lg resize-none dark:bg-boxdark dark:text-white"
                rows={3}
                placeholder="Add any specific instructions or requirements..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedRecruiter || loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Hiring...' : 'Hire Recruiter'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}