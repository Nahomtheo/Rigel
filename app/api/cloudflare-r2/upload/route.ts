import {NextResponse} from 'next/server'
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {r2} from "@/lib/r2";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {getUploadUrl} from "@/lib/uploadurl-r2";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
const key=`listings/${crypto.randomUUID()}/${Date.now()}`;
const UploadUrl=await getUploadUrl(key);
    return NextResponse.json({UploadUrl,key});
   

}