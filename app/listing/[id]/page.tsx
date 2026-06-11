// app/listing/[id]/page.tsx

import ListingClient from "./Client";

async function getListing(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/listings/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();
  return data.data;
}

// ✅ SEO METADATA (this is the important part)
export async function generateMetadata({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);

  return {
    title: `${listing.title} | Rigel Cars`,
    description: listing.description?.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.images?.length ? [listing.images[0]] : [],
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);

  return <ListingClient listing={listing} />;
}
