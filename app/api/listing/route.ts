import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary"
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const query: any = {
    status: { $in: ["approved", "pending"] }, // Only show approved or pending listings
  };

  // 🔹 Basic filters
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const location = searchParams.get("location");
  const featured = searchParams.get("featured");

   if (featured === "true") {
    query.isFeatured = true;
  }

  if (category) {
  const categories = category
    .split(",")
    .map((c) => c.trim().toLowerCase()) // 🔥 fix
    .filter(Boolean);

  query.category = { $in: categories };
}

  if (location) {
    query.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (minPrice) {
    query.pricing = { $gte: parseFloat(minPrice) };
  }

  // 🔥 DYNAMIC SPECS FILTERING
  searchParams.forEach((value, key) => {
    const excludedKeys = ["category", "minPrice", "location", "featured"];

    if (!excludedKeys.includes(key)) {
      // Example: key = "brand"
      // becomes: "specs.brand"
      query[`specs.${key}`] = value;
    }
  });

  const listings = await Listing.find(query).sort({ createdAt: -1 }).populate("owner");

  return Response.json(listings);

}
export async function POST(req: Request) {
  console.log("🚀 API START");
  await connectDB();


  try {
    console.log('before form data')
    const body = await req.json();
    console.log('after form data')

    const{ title,description,category,location,pricing,ownerId,specs}= body;
    const {images}= body
    console.log('this are;',{title,specs,description,category,location,pricing,ownerId})
    console.log("Received images:" , images);
   const user= await User.findById(new mongoose.Types.ObjectId('69e7c94136a1405d2872a38a'));
       console.log("User found:", user);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 🔐 Must be verified
    if (!user.isVerified) {
      return Response.json(
        { error: "You must be verified to post listings" },
        { status: 403 }
      );
    }
     
 console.log('this are 2nd;',{title,description,category,location,pricing,ownerId,specs,images})
      
    

    

   

    // 🏗 Create listing
    const listing = await Listing.create({
      title,
      description,
      category,
      location,
      pricing,
      images:images,
      specs,
      owner: ownerId,
      status: "approved",
    });
    console.log("Created listing:", listing);

    return Response.json(listing, { status: 201 });

  }
    catch (error) {
    return Response.json({ error: error } );
  };



};

