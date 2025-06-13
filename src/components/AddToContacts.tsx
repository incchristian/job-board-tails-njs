"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AddToContactsProps {
  targetUserId: string;
  targetUserName: string;
  targetUserClass: string;
}

export default function AddToContacts({ targetUserId, targetUserName, targetUserClass }: AddToContactsProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isContact, setIsContact] = useState(false);

  // Only show for employers looking at recruiters
  if (!session || session.user.userClass !== 'employer' || targetUserClass !== 'recruiter') {
    return null;
  }

  const handleAddContact = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recruiterId: targetUserId,
        }),
      });

      if (response.ok) {
        setIsContact(true);
        alert(`Contact request sent to ${targetUserName}!`);
      } else {
        alert('Failed to send contact request');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error sending contact request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-30">
      {isContact ? (
        <span className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg">
          Contact Added ✓
        </span>
      ) : (
        <button
          onClick={handleAddContact}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Adding...' : 'Add to Contacts'}
        </button>
      )}
    </div>
  );
}