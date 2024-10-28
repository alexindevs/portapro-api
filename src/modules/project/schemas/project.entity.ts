import { BaseEntity } from 'src/shared/schemas/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/user/schemas/user.entity';

@Entity()
export class Project extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  projectName: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // Possible values: Web Application, Mobile App, Scripting, etc.

  @Column({ type: 'date' })
  dateAdded: Date;

  @Column('simple-array') // stores as a comma-separated string
  toolsUsed: string[];

  @Column({ type: 'enum', enum: ['Completed', 'In Progress'] })
  projectStatus: 'Completed' | 'In Progress';

  @Column('simple-json', { nullable: true })
  media: {
    url: string;
    description?: string;
  }[];

  @Column('simple-array', { nullable: true })
  urls: string[];

  // Linking to the User entity
  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string; // Foreign key to link to User entity

  @Column({ type: 'varchar', unique: true, length: 22 })
  uid: string; // Unique identifier for sharing, generated with short-uuid
}
