import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { CloudinaryConfig } from '../file-storage/cloudinary.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './schemas/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  providers: [ProjectService, CloudinaryConfig],
  controllers: [ProjectController],
})
export class ProjectModule {}
