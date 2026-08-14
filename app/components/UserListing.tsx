import ListingCard from "./ListingCard";
import ListingActionMenu from "./ListingActionMenu";
import Link from "next/link";

export default async function UserListing({
  ownerId,
}: {
  ownerId: string;
}) {

  const query = new URLSearchParams({
    ownerId,
  }).toString();


  const resp = await fetch(
    `${process.env.NEXTAUTH_URL}/api/listing/my?${query}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );


  const listingData = await resp.json();

  console.log(listingData);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 pt-4">

        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 text-[#e0bd4c] text-[10px] tracking-[0.25em] uppercase font-medium">
            Your Inventory · የእኔ ዝርዝር
          </span>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-neutral-100 tracking-tight">
            Your Listings
          </h1>

          <p className="text-neutral-500 mt-2 text-sm">
            Manage and review all your posted listings
          </p>
        </div>


        <Link
          href="/createlisting"
          className="
          inline-flex
          items-center
          justify-center
          gap-2
          bg-[#C9A227]
          text-black
          font-bold
          px-5
          py-2.5
          rounded-full
          hover:bg-[#e2bd42]
          transition-all
          shadow-lg shadow-[#C9A227]/25
          hover:-translate-y-0.5
          w-fit
          "
        >

          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />

          </svg>

          Create New Listing

        </Link>

      </div>



      {/* Empty state */}
      {listingData.length === 0 && (

        <div className="
        flex
        flex-col
        items-center
        justify-center
        py-20
        bg-[#0c0a03]/40
        rounded-3xl
        border
        border-dashed
        border-neutral-800
        ">


          <p className="text-lg font-medium text-neutral-200">
            No listings found
          </p>


          <p className="text-neutral-500 text-sm mt-1 mb-4">
            Start by creating your first listing
          </p>


          <Link
            href="/createlisting"
            className="
            inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C9A227] text-black font-bold text-sm hover:bg-[#e2bd42] transition-colors
            "
          >
            Create a listing →
          </Link>


        </div>

      )}



      {/* Grid */}
      <div className="
      grid
      gap-6
      sm:grid-cols-2
      lg:grid-cols-3
      ">


        {listingData.map((item:any)=>(


          <div
            key={item._id}
            className="
            group
            bg-[#0c0a03]/60
            rounded-2xl
            border
            border-neutral-800/70
            shadow-sm
            overflow-visible
            hover:shadow-lg hover:shadow-[#C9A227]/10
            hover:border-[#C9A227]/30
            transition-colors
            duration-300
            mb-8

            "
          >



            <ListingCard

              id={item._id}

              title={item.title}

              price={item.price}

              category={item.category}

              subcategory={item.subcategory}

              isElectric={item.isElectric}

              isFeatured={item.isFeatured}

              location={item.location}

              images={item.images}

              createdAt={item.createdAt}

            />

            {/* Action Bar */}
            <div
              className="
              relative
              flex
              items-center
              justify-between
              px-3
              py-2
              bg-[#120f06]/60
              border-t
              border-neutral-800
              rounded-b-2xl
              "
            >
              <span
                className="
                text-xs
                text-neutral-500
                font-mono
                "
              >
                Edit or Delete
              </span>

              <ListingActionMenu

                id={item._id}

                ownerId={
                  typeof item.owner === "object"
                  ? item.owner._id
                  : item.owner
                }

              />


            </div>



          </div>


        ))}


      </div>


    </div>
  );
}