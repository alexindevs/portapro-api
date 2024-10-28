export class ProjectResponseDto {
  uid: string;
  projectName: string;
  category: string;
  dateAdded: Date;
  toolsUsed: string[];
  projectStatus: 'Completed' | 'In Progress';
  media?: {
    url: string;
    description?: string;
  }[];
  urls?: string[];
  userId: string;
}
