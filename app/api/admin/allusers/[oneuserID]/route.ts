import User from "@/models/User";
import Listing from "@/models/Listing";
import {NextResponse} from "next/server";
import {connectDB} from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

type UserParams = {
    params: Promise<{ oneuserID: string }>;
};

export async function GET( req:Request ,{params}: UserParams) {
    const { response } = await requireAdmin();
    if (response) return response;

    const {oneuserID}= await params
    try {
        await connectDB();
        const user=await User.findById(oneuserID).select("-password").lean()
        if (!user){return NextResponse.json({message:"no user"})}
        return NextResponse.json(user)
    } catch {
        return NextResponse.json({error:"Failed to fetch user"},{status:500})
    }
}

export async function PUT(req:Request ,{params}: UserParams) {
    const { response } = await requireAdmin();
    if (response) return response;

    const {verify,ban,deletecontent,documentVerification}=await req.json()
    
    const {oneuserID}= await params

    try {
        await connectDB();
        const user=await User.findById(oneuserID)
        if (!user){return NextResponse.json({message:"no user"})}
        if (typeof verify === "boolean"){
            user.isVerified=verify
        }
        if (typeof ban === "boolean"){
            user.isBanned=ban
        }
        if (deletecontent){
            await Listing.deleteMany({ owner: user._id })
        }
        if(documentVerification && ["approved", "rejected", "pending"].includes(documentVerification)){
            user.verification.status=documentVerification
        }
        await user.save()
        const updatedUser = await User.findById(oneuserID).select("-password").lean()
        return NextResponse.json({message:"user updated", user: updatedUser})
   
}
catch {
    return NextResponse.json({error:"Failed to update user"},{status:500})
}
}
