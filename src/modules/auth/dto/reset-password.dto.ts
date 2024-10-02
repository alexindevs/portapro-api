import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Reset token sent to the user',
    minLength: 6,
  })
  @IsString({ message: 'Reset token must be a string' })
  @MinLength(6, { message: 'Reset token must be at least 6 characters long' })
  resetToken: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password for the user',
    minLength: 8,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}
