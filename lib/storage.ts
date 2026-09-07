import { S3Client } from "@aws-sdk/client-s3";

export const uploadsBucket = "uploads";
export const storage = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "" },
  forcePathStyle: true,
});