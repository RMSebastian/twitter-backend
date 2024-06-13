import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConflictException } from "./errors";

const SECRET_KEY = process.env.BUCKET_SECRET_ACCESS_KEY as string;
const ACCESS_KEY = process.env.BUCKET_ACCESS_KEY as string;
const REGION = process.env.AWS_REGION as string;

const s3Client = new S3Client({
    region:REGION,
    credentials:{
        accessKeyId:ACCESS_KEY,
        secretAccessKey:SECRET_KEY
    }
})

export async function GetObjectFromS3(key: string): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 120 });
        return url;
    } catch (err) {
        throw err;
    }
}

export async function PutObjectFromS3(key: string): Promise<string> {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            ContentType: 'image/jpeg'
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 120 });
        
        console.log(url);
        return url;
    } catch (err) {
        throw err;
    }
}