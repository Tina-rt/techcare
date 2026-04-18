import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { RmqFilePayload } from './types/rmq-payload.interface';

@Controller()
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @MessagePattern('test_file_manager')
  testFileManager() {
    return { message: 'File Manager is operational' };
  }

  @MessagePattern('upload_file')
  async handleUploadFile(@Payload() data: RmqFilePayload) {
    console.log('Received upload_file message with metadata:', {
      originalname: data.originalname,
      mimetype: data.mimetype,
      folder: data.folder,
    });

    // Construct a pseudo-file object for the service
    // RabbitMQ serializes Buffer objects as { type: 'Buffer', data: number[] }
    const rawBuffer: Buffer | { type?: string; data?: number[] } = data.buffer;
    const resolvedBuffer =
      Buffer.isBuffer(rawBuffer)
        ? rawBuffer
        : Buffer.from(
            (rawBuffer as { data: number[] }).data ?? [],
          );
    const buffer = resolvedBuffer;

    const file = {
      buffer: buffer,
      originalname: data.originalname,
      mimetype: data.mimetype,
      size: data.size,
    } as Express.Multer.File;

    return this.fileManagerService.uploadFile(
      file,
      file.originalname,
      data.folder,
    );
  }

  @Get('test')
  testEndpoint() {
    return { message: 'File Manager is up and running!' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.fileManagerService.uploadFile(
      file,
      uploadFileDto.filename,
      uploadFileDto.folder,
      {
        originalName: file.originalname,
        uploadedBy: 'user-id-example',
        ...(uploadFileDto.tags && {
          tags: uploadFileDto.tags.join(','),
        }),
      },
    );
  }
}
