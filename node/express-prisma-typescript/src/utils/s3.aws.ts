import * as AWS from "aws-sdk";
import { ConflictException } from "./errors";

AWS.config.update({
    region: "sa-east-1",
    accessKeyId:process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export async function GetObjectFromS3(key: string): Promise<string>{
    try{
        const url = await s3.getSignedUrlPromise("getObject",{
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Expires: 120,
        });

        return url
    }catch(err){
        throw new ConflictException("GetObjectFromS3");
    }
}

export async function PutObjectFromS3(key: string): Promise<string>{
    try{
        const url = await s3.getSignedUrlPromise("putObject",{
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Expires: 120,
            ContentType: 'image/jpeg',
        });
        
        console.log(url);
        return url
    }catch(err){
        throw new ConflictException("PutObjectFromS3");
    }
}