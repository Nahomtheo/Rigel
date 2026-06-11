import ListingDetailPage from "./Client";

// 🔥 Fetch function (server-only) yes
async function getListing(id: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/listings/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await res.json();
  return data.data;
}

// ✅ SEO METADATA (runs on server before page loads)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const list = await params
  const ids=list.id.split('-').pop();

  if (!ids) {
    return {
      title: 'Listing not found',
    };
  }

  const listing = await getListing(ids);

  if (!listing) {
    return {
      title: "Listing not found | Rigel Cars",
      description: "This listing does not exist.",
    };
  }

  return {
    title: `${listing.title} | Rigel Cars`,
    description:
      listing.description?.slice(0, 160) ||
      "View this car listing on Rigel Cars",

    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.images?.length ? [listing.images[0]] : [],
    },

    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: listing.description,
      images: listing.images?.length ? [listing.images[0]] : [],
    },
  };
}

// ✅ PAGE (server component)
export default async function Page({
  params,
}: {
  params:Promise< { id: string }>;
}) {
     const list = await params
  const ids=list.id.split('-').pop();

  if (!ids) {
    return (<div> listing not found</div>)
  }

  const listing = await getListing(ids);

  if (!listing) {
    return (
      <div className="p-10 text-center">
        Listing not found
      </div>
    );
  }

  return (
    <ListingDetailPage listings={listing} />
  );
}
