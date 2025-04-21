"use client";

import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import { useProfile } from "@/context/ProfileContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Map OpenWeatherMap icon codes to local colorful icons
const weatherIconMap = {
  "01d": "/weather-icons/sunny.png",
  "01n": "/weather-icons/clear-night.png",
  "02d": "/weather-icons/partly-cloudy-day.png",
  "02n": "/weather-icons/partly-cloudy-night.png",
  "03d": "/weather-icons/cloudy.png",
  "03n": "/weather-icons/cloudy.png",
  "04d": "/weather-icons/overcast.png",
  "04n": "/weather-icons/overcast.png",
  "09d": "/weather-icons/shower-rain.png",
  "09n": "/weather-icons/shower-rain.png",
  "10d": "/weather-icons/rain.png",
  "10n": "/weather-icons/rain.png",
  "11d": "/weather-icons/thunderstorm.png",
  "11n": "/weather-icons/thunderstorm.png",
  "13d": "/weather-icons/snow.png",
  "13n": "/weather-icons/snow.png",
  "50d": "/weather-icons/fog.png",
  "50n": "/weather-icons/fog.png",
};

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { profilePic } = useProfile();
  const [weather, setWeather] = useState<{
    condition: string;
    temp: number;
    city: string;
    icon: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ type: string; id: number; label: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);
        const data = await response.json();
        setWeather({
          condition: data.weather[0].main,
          temp: Math.round(data.main.temp),
          city: data.name,
          icon: weatherIconMap[data.weather[0].icon] || "/weather-icons/default.png",
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setWeather(null);
          setLoading(false);
        }
      );
    } else {
      setWeather(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceFetch = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error("Search fetch failed");
        const { jobs, users } = await response.json();

        const jobSuggestions = jobs.map((job: { id: number; title: string }) => ({
          type: "job",
          id: job.id,
          label: job.title,
        }));

        const userSuggestions = users.map((user: { id: number; name: string; userClass: string }) => ({
          type: "user",
          id: user.id,
          label: `${user.name} (${user.userClass})`,
        }));

        setSuggestions([...jobSuggestions, ...userSuggestions]);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  const handleSelect = (type: string, id: number) => {
    if (type === "job") {
      router.push(`/jobs/${id}`);
    } else if (type === "user") {
      router.push(`/profile/${id}`);
    }
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>
          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image
              width={32}
              height={32}
              src={"/images/logo/logo-icon.svg"}
              alt="Logo"
            />
          </Link>
        </div>

        <div className="hidden sm:block relative">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <button type="submit" className="absolute left-0 top-1/2 -translate-y-1/2">
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search jobs, candidates, employers, recruiters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
              />
            </div>
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto dark:bg-boxdark">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(suggestion.type, suggestion.id)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-graydark cursor-pointer text-black dark:text-white"
                  >
                    {suggestion.label}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <div className="flex items-center gap-1 text-sm font-medium text-black dark:text-white">
            {loading ? (
              "Loading weather..."
            ) : weather ? (
              <>
                <Image
                  src={weather.icon}
                  alt={weather.condition}
                  width={16}
                  height={16}
                  className="inline-block"
                />
                <span>{`${weather.city}: ${weather.condition}, ${weather.temp}°C`}</span>
              </>
            ) : (
              "Weather unavailable"
            )}
          </div>
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
            <DropdownNotification />
            <DropdownMessage />
          </ul>
          <DropdownUser profilePic={profilePic} />
        </div>
      </div>
    </header>
  );
};

export default Header;