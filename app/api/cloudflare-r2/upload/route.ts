import {NextResponse} from 'next/server'
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {r2} from "@/lib/r2";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {getUploadUrl} from "@/lib/uploadurl-r2";

type Fileinfo={
    name:string,
    type:string
}

export async function POST(req:Request) {
    const session = await getServerSession(authOptions);
    const {files}= await req.json()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
   const data=await Promise.all(files.map(async (file:Fileinfo)=>{
    const key=`listings/${crypto.randomUUID()}/${Date.now()}`;
    const UploadUrl=await getUploadUrl(key);
    return({UploadUrl,key})


    }))

    return NextResponse.json({data});
   

}