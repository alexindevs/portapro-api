import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './schemas/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ResponseFormat } from 'src/shared/interfaces/response.interface';
import * as shortie from 'short-uuid';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async addProjectMedia(
    userId: string,
    uid: string,
    mediaFiles: { url: string; description: string }[],
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    const project = await this.projectRepository.findOne({
      where: { uid, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Initialize media array if it doesn't exist
    project.media = project.media || [];

    // Add new media files
    project.media.push(...mediaFiles);

    // Save the updated project
    await this.projectRepository.save(project);

    return this.createResponse('Media uploaded successfully', 200, project);
  }

  // Utility function to format responses
  private createResponse<T>(
    message: string,
    code: number,
    data: T,
  ): ResponseFormat<T> {
    return { message, code, data };
  }

  // Create a new project for a user
  async createProject(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    const uid = shortie.generate();
    const project = this.projectRepository.create({
      ...createProjectDto,
      uid,
      userId,
    });
    await this.projectRepository.save(project);
    return this.createResponse('Project created successfully', 201, project);
  }

  // Get all projects for a user
  async getUserProjects(
    userId: string,
  ): Promise<ResponseFormat<ProjectResponseDto[]>> {
    const projects = await this.projectRepository.find({ where: { userId } });
    return this.createResponse(
      'Projects retrieved successfully',
      200,
      projects,
    );
  }

  // Get a specific project by its UID
  async getProjectByUid(
    userId: string,
    uid: string,
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    const project = await this.projectRepository.findOne({
      where: { uid, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.createResponse('Project retrieved successfully', 200, project);
  }

  // Update a project by its UID
  async updateProject(
    userId: string,
    uid: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ResponseFormat<ProjectResponseDto>> {
    // Fetch the existing project
    const project = await this.projectRepository.findOne({
      where: { uid, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Append new URLs if provided
    if (updateProjectDto.urls && updateProjectDto.urls.length > 0) {
      project.urls = [...(project.urls || []), ...updateProjectDto.urls];
    }

    // Update JSON fields selectively for `media`
    // if (updateProjectDto.media && updateProjectDto.media.length > 0) {
    //   project.media = project.media || [];
    //   updateProjectDto.media.forEach((newMedia) => {
    //     const existingMedia = project.media.find((m) => m.url === newMedia.url);
    //     if (existingMedia) {
    //       // Update fields in the existing media entry
    //       Object.assign(existingMedia, newMedia);
    //     } else {
    //       // Add new media entry if not found
    //       project.media.push(newMedia);
    //     }
    //   });
    // }

    // Merge other fields from the DTO (ignoring `urls` and `media` which were handled above)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { urls, ...otherFields } = updateProjectDto;
    this.projectRepository.merge(project, otherFields);

    // Save the updated project
    await this.projectRepository.save(project);

    // Return the response in the specified format
    return this.createResponse('Project updated successfully', 200, project);
  }

  // Delete a project by its UID
  async deleteProject(
    userId: string,
    uid: string,
  ): Promise<ResponseFormat<null>> {
    const project = await this.projectRepository.findOne({
      where: { uid, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.projectRepository.remove(project);
    return this.createResponse('Project deleted successfully', 200, null);
  }
}
