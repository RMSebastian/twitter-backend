import { S3Service } from "./s3.service";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3ServiceImpl implements S3Service{
    constructor(private readonly client: S3Client){}

    async GetObjectFromS3(key: string): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: key,
            });
            const url = await getSignedUrl(this.client, command, { expiresIn: 120 });
            return url;
        } catch (err) {
            throw err;
        }
    }
    async PutObjectFromS3(key: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: key,
                ContentType: 'image/jpeg'
            });
            const url = await getSignedUrl(this.client, command, { expiresIn: 120 });
            
            console.log(url);
            return url;
        } catch (err) {
            throw err;
        }
    }


}