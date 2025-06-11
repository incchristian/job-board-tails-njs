import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";
import EditJobClient from "./EditJobClient";

async function fetchJob(jobId: string) {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  const job = await db.get(
    `SELECT id, title, description, location, employerId, logoPath, 
            lat, lng, country, state, street, city, postalCode 
     FROM jobs WHERE id = ?`,
    [jobId]
  );
  await db.close();
  return job;
}

interface EditJobPageProps {
  params: { jobId: string };
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { jobId } = params;
  const session = await getServerSession(authOptions);
  const job = await fetchJob(jobId);

  return <EditJobClient initialJob={job} session={session} />;
}