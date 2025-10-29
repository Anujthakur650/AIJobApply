import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { getEnv } from "@/lib/config/env";

type UploadPayload = {
  key: string;
  body: Buffer | Uint8Array | string | Readable;
  contentType: string;
};

let s3Client: S3Client | null = null;

const getClient = () => {
  const env = getEnv();

  if (!env.STORAGE_BUCKET || !env.STORAGE_REGION) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({ region: env.STORAGE_REGION });
  }

  return s3Client;
};

export const uploadDocument = async (payload: UploadPayload) => {
  const client = getClient();
  const env = getEnv();

  if (!client || !env.STORAGE_BUCKET) {
    throw new Error("Object storage is not configured");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: payload.key,
      Body: payload.body,
      ContentType: payload.contentType,
    })
  );
};
