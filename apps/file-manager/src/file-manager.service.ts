import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AwsConfigService } from './config/aws.config';
import { ConfigService } from '@nestjs/config';
import { UploadResponse } from './types/file.interface';
import { Readable } from 'stream';

@Injectable()
export class FileManagerService {
  private s3Client: S3Client;

  constructor(
    private awsConfig: AwsConfigService,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client(this.awsConfig.createS3Config());
    console.log(
      'S3 Client initialized with config:',
      this.awsConfig.createS3Config(),
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    filename: string,
    folder?: string,
    metadata?: Record<string, any>,
  ): Promise<UploadResponse> {
    try {
      const key = this.generateFileKey(filename, folder);
      this.validateFileType(file.mimetype);

      console.log('Uploading file ', filename);

      const buffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer);

      const command = new PutObjectCommand({
        Bucket: this.awsConfig.getS3Bucket(),
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        ContentLength: buffer.length,
        Metadata: metadata,
        // ChecksumAlgorithm: undefined,
        // ServerSideEncryption: 'AES256',
      });

      const result = await this.s3Client.send(command);
      return {
        key,
        url: `${this.awsConfig.getCloudfrontUrl()}${key}`,
        etag: result.ETag || '',
        versionId: result.VersionId,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'File upload failed');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      console.log('Deleting file with key:', key);
      const command = new DeleteObjectCommand({
        Bucket: this.awsConfig.getS3Bucket(),
        Key: key,
      });

      await this.s3Client.send(command);
      console.log('Successfully deleted file:', key);
    } catch (error) {
      console.error('Error deleting file:', error);
      // We don't throw here to avoid blocking product deletion if file deletion fails
    }
  }

  private generateFileKey(fileName: string, folder?: string): string {
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const prefix = folder ? `${folder}/` : 'uploads/';
    return `${prefix}${timestamp}-${safeName}`;
  }
  private validateFileType(mimeType: string): void {
    const allowedTypes = this.configService.get('app.allowedMimeTypes');
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} is not allowed`);
    }
  }

  private getContentTypeFromKey(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      txt: 'text/plain',
      json: 'application/json',
    };
    return extension
      ? mimeTypes[extension] || 'application/octet-stream'
      : 'application/octet-stream';
  }
}
