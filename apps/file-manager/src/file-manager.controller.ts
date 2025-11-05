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

@Controller()
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

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
