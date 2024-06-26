export interface S3Service{
    GetObjectFromS3(key: string): Promise<string>
    PutObjectFromS3(key:string): Promise<string>
}