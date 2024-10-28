import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFiles,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ResponseFormat } from 'src/shared/interfaces/response.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CloudinaryConfig } from '../file-storage/cloudinary.config';

@ApiTags('Projects')
@Controller('projects')
@ApiBearerAuth()
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly cloudinaryConfig: CloudinaryConfig,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createProject(
    @Request() req,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    return this.projectService.createProject(req.user.userId, createProjectDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all projects for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [ProjectResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProjects(
    @Request() req,
  ): Promise<ResponseFormat<ProjectResponseDto[]>> {
    return this.projectService.getUserProjects(req.user.userId);
  }

  @Get(':uid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific project by UID' })
  @ApiParam({
    name: 'uid',
    description: 'Unique identifier of the project',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectByUid(
    @Request() req,
    @Param('uid') uid: string,
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    return this.projectService.getProjectByUid(req.user.userId, uid);
  }

  @Put(':uid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({
    name: 'uid',
    description: 'Unique identifier of the project',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async updateProject(
    @Request() req,
    @Param('uid') uid: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    return this.projectService.updateProject(
      req.user.userId,
      uid,
      updateProjectDto,
    );
  }

  @Delete(':uid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({
    name: 'uid',
    description: 'Unique identifier of the project',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(
    @Request() req,
    @Param('uid') uid: string,
  ): Promise<ResponseFormat<null>> {
    return this.projectService.deleteProject(req.user.userId, uid);
  }

  @Post(':uid/upload-media')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'media', maxCount: 10 }]))
  @ApiOperation({ summary: 'Upload media files for a project' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        media: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        descriptions: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Media uploaded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async uploadProjectMedia(
    @Request() req,
    @Param('uid') uid: string,
    @UploadedFiles() files: { media?: Express.Multer.File[] },
    @Body('descriptions') descriptions?: string[],
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    if (!files?.media || files.media.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Upload all files to Cloudinary
    const uploadedFiles = await Promise.all(
      files.media.map(async (file, index) => {
        const result = await this.cloudinaryConfig.uploadFileFromBuffer(
          file.buffer,
        );
        return {
          url: result.secure_url,
          description: descriptions?.[index] || '',
        };
      }),
    );

    // Add the uploaded media to the project
    return this.projectService.addProjectMedia(
      req.user.userId,
      uid,
      uploadedFiles,
    );
  }
}
