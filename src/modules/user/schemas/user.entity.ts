import { BaseEntity } from 'src/shared/schemas/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import { Project } from 'src/modules/project/schemas/project.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @Length(2, 50)
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  @Length(2, 50)
  lastName: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', unique: true, length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: false })
  agreedToTerms: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
