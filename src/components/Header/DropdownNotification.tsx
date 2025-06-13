"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
}

const DropdownNotification = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // Fetch notifications
  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(
          data.notifications.filter((n: Notification) => !n.isRead).length
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Handle accept contact request
  const handleAcceptContact = async (
    employerId: number,
    notificationId: number
  ) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId, action: "accept" }),
      });

      if (response.ok) {
        // Mark notification as read
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });

        fetchNotifications(); // Refresh notifications
        alert("Contact request accepted!");
      }
    } catch (error) {
      console.error("Error accepting contact:", error);
    }
  };

  // Handle decline contact request
  const handleDeclineContact = async (
    employerId: number,
    notificationId: number
  ) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId, action: "decline" }),
      });

      if (response.ok) {
        // Mark notification as read
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId }),
        });

        fetchNotifications(); // Refresh notifications
        alert("Contact request declined");
      }
    } catch (error) {
      console.error("Error declining contact:", error);
    }
  };

  // Close dropdown handlers
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  if (!session) return null;

  return (
    <li className="relative">
      <Link
        ref={trigger}
        onClick={() => {
          setDropdownOpen(!dropdownOpen);
        }}
        href="#"
        className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
      >
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1">
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>
        )}

        <svg
          className="fill-current duration-300 ease-in-out"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
            fill=""
          />
        </svg>
      </Link>

      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80 ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <div className="px-4.5 py-3">
          <h5 className="text-sm font-medium text-bodydark2">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h5>
        </div>

        <ul className="flex h-auto flex-col overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="px-4.5 py-3 text-center text-sm text-bodydark2">
              No notifications
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <div
                  className={`flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 ${
                    !notification.isRead
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-bodydark2 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1"></span>
                    )}
                  </div>

                  {/* Contact request buttons */}
                  {notification.type === "contact_request" &&
                    notification.relatedId && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleAcceptContact(
                              notification.relatedId!,
                              notification.id
                            )
                          }
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleDeclineContact(
                              notification.relatedId!,
                              notification.id
                            )
                          }
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                  <p className="text-xs text-bodydark2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </li>
  );
};

export default DropdownNotification;
