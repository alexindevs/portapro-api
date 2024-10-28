import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as streamifier from 'streamifier';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryConfig {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadFile(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, (error, result) => {
        if (error) return reject(error);
        fs.unlinkSync(filePath);
        resolve(result);
      });
    });
  }

  async uploadFileFromBuffer(fileBuffer: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream); // Convert buffer to stream and upload
    });
  }
}
