"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EditJobClient from "./EditJobClient";

export default function EditJobClientWrapper({ initialJob, session }) {
  return (
    <DefaultLayout>
      <EditJobClient initialJob={initialJob} session={session} />
    </DefaultLayout>
  );
}