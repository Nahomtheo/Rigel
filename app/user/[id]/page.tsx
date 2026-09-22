import PublicProfile from "@/app/components/PublicProfile";

async function getProfile(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/user/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProfile(id);

  if (!data.success) {
    return {
      title: "User not found | Rigel Cars",
    };
  }

  return {
    title: `${data.data.user.name} | Rigel Cars`,
    description: `View ${data.data.user.name}'s profile and their ${data.data.listings.length} listing(s) on Rigel Cars`,
    openGraph: {
      title: data.data.user.name,
      description: "View this seller's profile and listings on Rigel Cars",
      images: data.data.user.profileImage ? [data.data.user.profileImage] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProfile(id);

  if (!data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold text-neutral-100 mb-2">
            User not found
          </h1>
          <p className="text-neutral-500 mb-4">
            This profile does not exist.
          </p>
        </div>
      </div>
    );
  }

  return <PublicProfile user={data.data.user} listings={data.data.listings} />;
}