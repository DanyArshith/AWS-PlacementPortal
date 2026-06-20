const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../config/s3');

const BUCKET_NAME = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION || 'us-east-1';

// Check if S3 is configured (i.e. not the default example placeholder)
const isS3Configured = BUCKET_NAME && BUCKET_NAME !== 'your-s3-bucket-name' && BUCKET_NAME !== '';

/**
 * Uploads a file buffer directly to S3 (Server-mediated upload).
 * @param {Buffer} fileBuffer - The binary buffer of the file.
 * @param {string} fileName - Original filename.
 * @param {string} mimeType - File mimetype.
 * @param {string} folderPrefix - The directory folder (e.g. 'resumes', 'photos', 'logos').
 * @returns {Promise<string>} S3 Object Key (stored in MongoDB).
 */
exports.uploadFile = async (fileBuffer, fileName, mimeType, folderPrefix) => {
  const uniqueName = `${folderPrefix}/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;

  if (!isS3Configured) {
    console.warn(`AWS S3 not configured or set to placeholder. Falling back to mock URL for: ${uniqueName}`);
    return `mock://${uniqueName}`;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueName,
      Body: fileBuffer,
      ContentType: mimeType
    });

    await s3.send(command);
    console.log(`Successfully uploaded file to S3: s3://${BUCKET_NAME}/${uniqueName}`);
    return uniqueName;
  } catch (error) {
    console.error('Error uploading file to AWS S3:', error);
    throw error;
  }
};

/**
 * Generates a presigned GET URL for downloading/viewing a private S3 object.
 * @param {string} objectKey - The S3 object key.
 * @param {number} expiresInSeconds - Expiration duration in seconds (default is 1 hour).
 * @returns {Promise<string>} Temporary presigned GET URL.
 */
exports.getDownloadUrl = async (objectKey, expiresInSeconds = 3600) => {
  if (!objectKey) return '';

  // If mock key or already a full URL, return as is
  if (objectKey.startsWith('mock://') || objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey;
  }

  if (!isS3Configured) {
    console.warn(`AWS S3 not configured. Cannot generate download URL for key: ${objectKey}`);
    return `https://s3.${REGION}.amazonaws.com/mock-bucket/${objectKey}`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey
    });

    return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    return `https://s3.${REGION}.amazonaws.com/${BUCKET_NAME}/${objectKey}`;
  }
};

/**
 * Generates a presigned PUT URL for direct S3 upload from the browser client.
 * @param {string} fileName - Target filename.
 * @param {string} mimeType - File mimetype.
 * @param {string} folderPrefix - The directory folder.
 * @param {number} expiresInSeconds - Expiration in seconds (default 10 minutes).
 * @returns {Promise<{uploadUrl: string, key: string}>} Presigned URL and key.
 */
exports.getUploadUrl = async (fileName, mimeType, folderPrefix, expiresInSeconds = 600) => {
  const uniqueName = `${folderPrefix}/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;

  if (!isS3Configured) {
    console.warn(`AWS S3 not configured. Generating mock direct upload details for key: ${uniqueName}`);
    return {
      uploadUrl: `http://127.0.0.1:4000/api/mock-s3-upload/${uniqueName}`,
      key: `mock://${uniqueName}`
    };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueName,
      ContentType: mimeType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
    return { uploadUrl, key: uniqueName };
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw error;
  }
};
