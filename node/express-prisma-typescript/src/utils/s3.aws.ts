import * as AWS from "aws-sdk";
import { NotFoundException } from "./errors";

AWS.config.update({
    region: "sa-east-1",
    accessKeyId:process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export async function GetObjectFromS3(key: string){
    try{
        const url = await s3.getSignedUrlPromise("getObject",{
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Expire: 60,
        });
    }catch(err){
        throw new NotFoundException("url");
    }

}
export async function PutObjectFromS3(key: string){
    const url = await s3.getSignedUrlPromise("putObject",{
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Expire: 60,
    });
}