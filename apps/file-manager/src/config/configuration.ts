export default () => ({
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,

    cloudfront: {
      url: process.env.AWS_CLOUDFRONT_URL + '/' || '',
    },

    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'my-default-bucket',
      baseUrl: `https://${process.env.AWS_S3_BUCKET_NAME || 'my-default-bucket'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/`,
    },
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'text/plain',
    ],
  },
});
