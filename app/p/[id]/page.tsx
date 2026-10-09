import { Metadata } from "next";
import { notFound } from "next/navigation";
import VisitingCardView, { PublicProfileUser } from "./VisitingCardView";

interface PublicProfileProps {
  params: Promise<{ id: string }>;
}

async function getPublicProfile(id: string): Promise<PublicProfileUser | null> {
  const query = `
    query PublicProfile($id: ID!) {
      publicProfile(id: $id) {
        id
        employeeId
        firstName
        lastName
        email
        phoneNumber
        profilePictureUrl
        isVerified
        role
        employmentType
        designation {
          name
        }
        department {
          name
        }
        organization {
          name
          logo {
            url
          }
          accent
        }
        officeLocation {
          name
        }
      }
    }
  `;

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://127.0.0.1:8000/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { id },
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (json.errors) {
      console.error("GraphQL Errors:", json.errors);
    }
    return json?.data?.publicProfile || null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PublicProfileProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Profile Not Found" };

  const user = await getPublicProfile(id);
  if (!user) {
    return { title: "Profile Not Found" };
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const orgName = user.organization?.name || "TeamZen";
  const title = `${fullName} | Digital Visiting Card - ${orgName}`;
  const description = `${user.designation?.name || "Team Member"}${user.department?.name ? ` • ${user.department.name}` : ""} at ${orgName}. Scan or save contact card.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: user.profilePictureUrl ? [{ url: user.profilePictureUrl }] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  const user = await getPublicProfile(id);

  if (!user) {
    notFound();
  }

  return <VisitingCardView user={user} />;
}
