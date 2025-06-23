"use client";

import { useEffect, useState } from "react";
import useColorMode from "@/hooks/useColorMode";

const DarkModeSwitcher = () => {
  const [colorMode, setColorMode] = useColorMode();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return consistent server-side content until mounted
  if (!mounted) {
    return (
      <li>
        <label className="relative m-0 block h-7.5 w-14 rounded-full bg-stroke">
          <input
            type="checkbox"
            checked={false}
            onChange={() => {}}
            className="absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
            readOnly
          />
          <span className="absolute left-[3px] top-1/2 flex h-6 w-6 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white shadow-switcher duration-75 ease-linear">
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.99992 12.6666C10.5772 12.6666 12.6666 10.5772 12.6666 7.99992C12.6666 5.42259 10.5772 3.33325 7.99992 3.33325C5.42259 3.33325 3.33325 5.42259 3.33325 7.99992C3.33325 10.5772 5.42259 12.6666 7.99992 12.6666Z"
                  fill="#969AA1"
                />
              </svg>
            </span>
          </span>
        </label>
      </li>
    );
  }

  // Show actual component after hydration
  return (
    <li>
      <label
        className={`relative m-0 block h-7.5 w-14 rounded-full ${
          colorMode === "dark" ? "bg-primary" : "bg-stroke"
        }`}
      >
        <input
          type="checkbox"
          checked={colorMode === "dark"}
          onChange={() => {
            if (typeof setColorMode === "function") {
              setColorMode(colorMode === "light" ? "dark" : "light");
            }
          }}
          className="absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={`absolute left-[3px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-switcher duration-75 ease-linear ${
            colorMode === "dark" ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <span className={colorMode === "dark" ? "hidden" : "block"}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.99992 12.6666C10.5772 12.6666 12.6666 10.5772 12.6666 7.99992C12.6666 5.42259 10.5772 3.33325 7.99992 3.33325C5.42259 3.33325 3.33325 5.42259 3.33325 7.99992C3.33325 10.5772 5.42259 12.6666 7.99992 12.6666Z"
                fill="#969AA1"
              />
            </svg>
          </span>
          <span className={colorMode === "dark" ? "block" : "hidden"}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.3533 10.62C14.2466 10.44 13.9466 10.16 13.1999 10.2933C12.7866 10.3667 12.3666 10.4 11.9466 10.38C10.3933 10.3133 8.98659 9.6 8.00659 8.5C7.01992 7.4 6.37325 5.94 6.39325 4.52C6.39992 4.05333 6.44659 3.6 6.51325 3.15333C6.59325 2.67333 6.50659 2.27333 6.39325 2.15333C6.27992 2.03333 5.88659 1.94 5.39325 2.03333C4.49325 2.19333 3.63992 2.54667 2.91325 3.08C1.29992 4.28 0.666589 6.34 1.18659 8.28C1.70659 10.22 3.29325 11.65 5.27325 12.08C5.85992 12.2067 6.45992 12.24 7.04659 12.18C8.09992 12.08 9.11325 11.7467 9.99325 11.2133C10.8733 10.68 11.5866 9.97333 12.0866 9.13333C12.5866 8.29333 12.8533 7.36 12.8733 6.42C12.8933 5.95333 12.8533 5.48667 12.7533 5.03333C12.6533 4.64 12.8066 4.32 12.9466 4.18C13.0866 4.04 13.4133 3.87333 13.8133 4.02C14.2133 4.16667 14.5533 4.4 14.8266 4.68C15.6533 5.56 16.0733 6.78667 15.9466 8.01333C15.8199 9.24 15.1866 10.3733 14.1866 11.1533C13.1866 11.9333 11.9066 12.3067 10.6533 12.2C9.39992 12.0933 8.23992 11.52 7.39325 10.5933C6.54659 9.66667 6.08659 8.46 6.09992 7.21333C6.11325 5.96667 6.59992 4.77333 7.46659 3.86C8.33325 2.94667 9.51325 2.38 10.7666 2.26C12.0199 2.14 13.2733 2.48 14.2866 3.22C14.7933 3.59333 15.1999 4.09333 15.4666 4.68C15.7333 5.26667 15.8466 5.91333 15.7933 6.56C15.7399 7.20667 15.5199 7.82 15.1533 8.34C14.7866 8.86 14.2866 9.26667 13.7066 9.52C13.1266 9.77333 12.4866 9.86 11.8533 9.76C11.2199 9.66 10.6266 9.38 10.1399 8.96C9.65325 8.54 9.29325 7.99333 9.09325 7.38C8.89325 6.76667 8.86659 6.11333 9.01992 5.48C9.17325 4.84667 9.49992 4.26667 9.95992 3.8C10.4199 3.33333 10.9933 3.00667 11.6199 2.85333C12.2466 2.7 12.8999 2.73333 13.5066 2.95333C14.1133 3.17333 14.6466 3.56667 15.0399 4.08C15.4333 4.59333 15.6666 5.21333 15.7133 5.85333C15.7599 6.49333 15.6199 7.13333 15.3066 7.7C14.9933 8.26667 14.5199 8.73333 13.9466 9.04C13.3733 9.34667 12.7266 9.48 12.0866 9.42C11.4466 9.36 10.8399 9.11333 10.3466 8.71333C9.85325 8.31333 9.29325 7.77333 9.31325 7.16C9.13325 6.54667 9.14659 5.89333 9.35325 5.28C9.55992 4.66667 9.94659 4.12667 10.4666 3.72C10.9866 3.31333 11.6199 3.06 12.2733 3.0"
                fill="#969AA1"
              />
            </svg>
          </span>
        </span>
      </label>
    </li>
  );
};

export default DarkModeSwitcher;
