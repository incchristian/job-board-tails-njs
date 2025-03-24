import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EditJobClient from "./EditJobClient"; // Use your provided component

async function fetchJob(jobId) {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  const job = await db.get(
    "SELECT id, title, description, location, logoPath, employerId FROM jobs WHERE id = ?",
    [jobId]
  );
  await db.close();
  return job;
}

export default async function EditJobPage({ params }) {
  const { jobId } = params; // Matches [jobId] folder
  const session = await getServerSession(authOptions);
  const job = await fetchJob(jobId);

  return <EditJobClient initialJob={job} session={session} />;
}