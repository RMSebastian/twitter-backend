import { S3Service } from "./s3.service";

export class S3ServiceImplMock implements S3Service{
    GetObjectFromS3 = jest.fn();
    PutObjectFromS3 = jest.fn();
}