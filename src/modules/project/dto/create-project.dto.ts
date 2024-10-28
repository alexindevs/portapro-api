import {
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsArray,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Name of the project',
    example: 'Weather App',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @Length(2, 255)
  projectName: string;

  @ApiProperty({
    description: 'Category of the project',
    example: 'Web Application',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50)
  category: string;

  @ApiProperty({
    description: 'Date the project was added',
    example: '2023-01-01',
    type: 'string',
    format: 'date',
  })
  @Type(() => Date)
  @IsDate()
  dateAdded: Date;

  @ApiProperty({
    description: 'List of tools used in the project',
    example: ['TypeScript', 'NestJS', 'TypeORM'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  toolsUsed: string[];

  @ApiProperty({
    description: 'Current status of the project',
    example: 'In Progress',
    enum: ['Completed', 'In Progress'],
  })
  @IsEnum(['Completed', 'In Progress'])
  projectStatus: 'Completed' | 'In Progress';

  // @ApiProperty({
  //   description: 'Media related to the project',
  //   example: [
  //     {
  //       url: 'http://example.com/image.jpg',
  //       description: 'Project screenshot',
  //     },
  //   ],
  //   type: [{ url: 'string', description: 'string' }],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray()
  // media?: {
  //   url: string;
  //   description?: string;
  // }[];

  @ApiProperty({
    description: 'Additional URLs related to the project',
    example: ['http://github.com/example'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];
}
