import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './schemas/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import TypeORM for User Entity
  providers: [UserService], // Register the UserService
  // controllers: [UserController], // Register the UserController (if needed)
  exports: [UserService], // Export UserService for use in other modules
})
export class UserModule {}
