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
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @MessagePattern('test_file_manager')
  async testFileManager(data: any) {
    console.log('Received test_file_manager message with data:', data);
    return { message: 'File Manager is operational', data };
  }

  @MessagePattern('upload_file')
  async handleUploadFile(data: any) {
    console.log('Received upload_file message with data:', data);
    const file = data as Express.Multer.File;
    return this.fileManagerService.uploadFile(file, file.originalname);
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
