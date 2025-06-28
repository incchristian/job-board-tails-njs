"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
  showSidebarToggle?: boolean;
}) => {
  const { data: session, status } = useSession();
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    const getWeatherData = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
              // Use Open-Meteo API (free, no API key required)
              const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
              );

              // Try multiple location services for better accuracy
              let locationName = "Your Location";

              try {
                // Try OpenStreetMap Nominatim first (more accurate)
                const nominatimResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
                );

                if (nominatimResponse.ok) {
                  const nominatimData = await nominatimResponse.json();
                  locationName =
                    nominatimData.address?.city ||
                    nominatimData.address?.town ||
                    nominatimData.address?.village ||
                    nominatimData.address?.county ||
                    nominatimData.display_name?.split(",")[0] ||
                    "Your Location";
                } else {
                  // Fallback to BigDataCloud
                  const locationResponse = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
                  );

                  if (locationResponse.ok) {
                    const locationData = await locationResponse.json();
                    locationName =
                      locationData.city ||
                      locationData.locality ||
                      locationData.principalSubdivision ||
                      locationData.countryName ||
                      "Your Location";
                  }
                }
              } catch (locError) {
                console.log("Location service unavailable, using fallback");
              }

              if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json();
                const temp = Math.round(weatherData.current_weather.temperature);
                const weatherCode = weatherData.current_weather.weathercode;

                setWeather({
                  temp: temp,
                  condition: getWeatherCondition(weatherCode),
                  icon: getWeatherIconFromCode(weatherCode),
                });

                setLocation(locationName);
              } else {
                // Use browser's approximate location
                setWeather({
                  temp: 20,
                  condition: "Clear",
                  icon: "🌤️",
                });
                setLocation(locationName);
              }
            } catch (error) {
              console.log("Weather service unavailable");
              setWeather({
                temp: 20,
                condition: "Clear",
                icon: "🌤️",
              });
              setLocation("Your Location");
            }
          },
          (error) => {
            console.log("Location access denied");
            // Location denied, use generic data
            setWeather({
              temp: 20,
              condition: "Clear",
              icon: "🌤️",
            });
            setLocation("Location Unknown");
          },
          // Add options for better accuracy
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        // Geolocation not supported
        setWeather({
          temp: 20,
          condition: "Clear",
          icon: "🌤️",
        });
        setLocation("Location Unknown");
      }
    };

    getWeatherData();
  }, []);

  const getWeatherCondition = (code: number) => {
    if (code === 0) return "Clear";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Cloudy";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Showers";
    if (code <= 99) return "Thunderstorm";
    return "Clear";
  };

  const getWeatherIconFromCode = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 99) return "⛈️";
    return "🌤️";
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Mobile menu button - only show for admin users */}
          {props.showSidebarToggle && (
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
          )}
        </div>

        <div className="hidden sm:block">
          {/* Logo or title */}
          <Link href="/" className="text-xl font-bold text-black dark:text-white">
            Job Board
          </Link>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Weather Widget */}
          {weather && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-lg">{weather.icon}</span>
              <div className="text-sm">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  {weather.temp}°C
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 truncate max-w-20">
                  {location}
                </div>
              </div>
            </div>
          )}

          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />

            {/* Show notifications and messages only when logged in */}
            {session && (
              <>
                <DropdownNotification />
                <DropdownMessage />
              </>
            )}
          </ul>

          {/* Show user dropdown when logged in, login link when not */}
          {status === "loading" ? (
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session ? (
            <DropdownUser />
          ) : (
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;