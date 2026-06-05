import {PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "./r2";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

export async function getUploadUrl(key: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,});
    const url = await getSignedUrl(r2, command, { expiresIn: 3600 });
    return url;
}