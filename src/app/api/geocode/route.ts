import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log("API Key from env:", apiKey); // Debug log

  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address || "")}&key=${apiKey}`;
  console.log("Fetching URL:", url); // Debug log

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log("Google API response:", data); // Debug log
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API fetch error:", error.message);
    return NextResponse.json({ error: "Failed to geocode", details: error.message }, { status: 500 });
  }
}