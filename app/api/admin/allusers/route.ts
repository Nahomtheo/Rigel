
import User from "@/models/User";   
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";


export  async function GET( req:Request ) {
    const { response } = await requireAdmin();
    if (response) return response;

    const {searchParams} = new URL(req.url)
    const search=searchParams.get("search") || ""
    const isVerified=searchParams.get("isVerified")
    const role=searchParams.get("role")
    const isPremium=searchParams.get("isPremium")
    const isBanned=searchParams.get("isBanned")
    const query: Record<string, unknown> = {}
    if (search){
        query.$or=[
            {name:{$regex:search,$options:"i"}},
            {email:{$regex:search,$options:"i"}}
        ]
    }
    if (isVerified !== null && isVerified !== undefined && isVerified !== "") {
        query.isVerified = isVerified === "true";
    }
    if (role !== null && role !== undefined && role !== "") {
        query.role = role;
    }
    if (isPremium !== null && isPremium !== undefined && isPremium !== "") {
        query.isPremium = isPremium === "true";
    }
    if (isBanned !== null && isBanned !== undefined && isBanned !== "") {
        query.isBanned = isBanned === "true";
    }

    try {
        await connectDB();
        const users=await User.find(query).select("-password").lean()
        if (!users){return NextResponse.json({message:"no user"})}
        return NextResponse.json(users)
    } catch {
        return NextResponse.json({error:"Failed to fetch users"},{status:500})
    }   


}
