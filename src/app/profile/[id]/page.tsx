import sqlite3 from "sqlite3";
import { open } from "sqlite";
import Image from "next/image";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AddToContacts from "@/components/AddToContacts";

interface ProfilePageProps {
  params: { id: string };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = await open({
    filename: "./database.sqlite", // Relative path
    driver: sqlite3.Database,
  });

  const user = await db.get(
    "SELECT name, email, userClass, company, bio, profilePicture FROM users WHERE id = ?",
    [id]
  );

  await db.close();

  if (!user) {
    notFound();
  }

  const userName = user.name || "Anonymous User";
  const userEmail = user.email || "No email provided";
  const profilePicture = user.profilePicture || "/images/user/user-06.png";
  const bio = user.bio || "No bio set yet";

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName={`${userName}\'s Profile`} /> {/* Escaped single quote */}

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="relative z-20 h-35 md:h-65">
            <Image
              src="/images/cover/cover-01.png"
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
              width={970}
              height={260}
            />
            {/* Add to Contacts button positioned in top right corner */}
            <AddToContacts 
              targetUserId={id}
              targetUserName={userName}
              targetUserClass={user.userClass}
            />
          </div>
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2">
                <Image
                  src={profilePicture}
                  width={160}
                  height={160}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  alt="profile"
                />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {userName}
              </h3>
              <p className="font-medium">{userEmail}</p>
              <p className="font-medium text-gray-600 dark:text-gray-400">
                Role: {user.userClass}
              </p>
              {user.company && (
                <p className="font-medium text-gray-600 dark:text-gray-400">
                  Company: {user.company}
                </p>
              )}
              <div className="mx-auto max-w-180">
                <h4 className="font-semibold text-black dark:text-white mt-4.5">
                  About Me
                </h4>
                <p className="mt-4.5">{bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}