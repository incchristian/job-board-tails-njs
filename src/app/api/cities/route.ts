import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input"); // State or province name
  const country = searchParams.get("country");

  const username = process.env.GEONAMES_USERNAME; // Correct env variable name
  console.log("GeoNames username:", username); // Debug log

  if (!username) {
    return NextResponse.json({ error: "GeoNames username is not configured" }, { status: 500 });
  }

  // Full admin codes for Canada and US
  const adminCodes = {
    Canada: {
      Alberta: "01",
      "British Columbia": "02",
      Manitoba: "03",
      "New Brunswick": "04",
      "Newfoundland and Labrador": "05",
      "Nova Scotia": "07",
      Ontario: "08",
      "Prince Edward Island": "09",
      Quebec: "10", // Added Quebec
      Saskatchewan: "11",
    },
    "United States": {
      Alabama: "AL",
      Alaska: "AK",
      Arizona: "AZ",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      Delaware: "DE",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
    },
  };

  const adminCode = adminCodes[country]?.[input];
  if (!adminCode) {
    console.log(`No admin code found for ${country}: ${input}`);
    return NextResponse.json({ error: "Invalid state/province" }, { status: 400 });
  }

  const url = `http://api.geonames.org/searchJSON?country=${country === "Canada" ? "CA" : "US"}&adminCode1=${adminCode}&featureClass=P&maxRows=1000&username=${username}`;
  console.log("Fetching URL:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log("GeoNames API response:", data);

    if (!data.geonames || !Array.isArray(data.geonames)) {
      throw new Error("Invalid GeoNames response: No geonames array");
    }

    const cities = data.geonames.map((place: any) => place.name).sort();
    return NextResponse.json({ status: "OK", cities });
  } catch (error: any) {
    console.error("API fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch cities", details: error.message }, { status: 500 });
  }
}