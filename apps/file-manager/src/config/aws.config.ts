import { S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  constructor(private configService: ConfigService) {}

  createS3Config(): S3ClientConfig {
    console.log('Creating S3 Config with the following settings:');
    console.log('Region:', this.configService.get<string>('aws.region'));
    console.log(
      'Access Key ID:',
      this.configService.get<string>('aws.accessKeyId')
        ? 'Provided'
        : 'Not Provided',
    );
    console.log(
      'Secret Access Key:',
      this.configService.get<string>('aws.secretAccessKey')
        ? 'Provided'
        : 'Not Provided',
    );
    return {
      region: this.configService.get<string>('aws.region'),
      endpoint: this.configService.get<string>('aws.endpoint'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('aws.secretAccessKey') || '',
      },
      maxAttempts: 3,
    };
  }

  getS3Bucket(): string {
    return this.configService.get('aws.s3.bucketName') || '';
  }

  getBaseUrl(): string {
    return this.configService.get('aws.s3.baseUrl') || '';
  }
}
