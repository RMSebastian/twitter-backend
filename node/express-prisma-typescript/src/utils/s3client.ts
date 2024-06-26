import { S3Client } from "@aws-sdk/client-s3";
const SECRET_KEY = process.env.BUCKET_SECRET_ACCESS_KEY as string;
const ACCESS_KEY = process.env.BUCKET_ACCESS_KEY as string;
const REGION = process.env.AWS_REGION as string;

export const s3Client = new S3Client({
    region:REGION,
    credentials:{
        accessKeyId:ACCESS_KEY,
        secretAccessKey:SECRET_KEY
    }
})