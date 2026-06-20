const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');
const { S3Client, PutObjectCommandOutput } = require('@aws-sdk/client-s3');

const BUCKET = process.env.S3_BUCKET;

exports.uploadStream = async (buffer, key, contentType) => {
  if (!BUCKET) throw new Error('S3_BUCKET not set');
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType
  };
  await s3.send(new PutObjectCommand(params));
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return url;
};
