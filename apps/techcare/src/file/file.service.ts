import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileUploadResponse, sendAndCatch } from '@app/shared';

@Injectable()
export class FileService {
  constructor(
    @Inject('FILE_MANAGER_SERVICE')
    private readonly fileClient: ClientProxy,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<FileUploadResponse> {
    // When sending via RMQ, we need to ensure the buffer is included in the payload
    const payload = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder: folder || 'uploads',
    };
    return sendAndCatch<FileUploadResponse>(
      this.fileClient,
      'upload_file',
      payload,
      undefined,
      60_000, // 60s — S3 uploads can be slow for large files
    );
  }

  async getPresignedUploadUrl(
    filename: string,
    mimeType: string,
    folder: string = 'products',
  ): Promise<{ uploadUrl: string; fileKey: string; finalUrl: string }> {
    return sendAndCatch<{ uploadUrl: string; fileKey: string; finalUrl: string }>(
      this.fileClient,
      'get_presigned_upload_url',
      { filename, mimeType, folder },
    );
  }
}
