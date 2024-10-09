import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mailer/mail.service';
import { generateSixDigitToken } from 'src/utils/generate-token';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseFormat } from 'src/shared/interfaces/response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
  ) {}

  private createResponse<T>(
    message: string,
    code: number,
    data: T,
  ): ResponseFormat<T> {
    return { message, code, data };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<ResponseFormat<{ access_token: string }>> {
    const { email, password } = loginDto;
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException(
        this.createResponse('Invalid credentials', 401, null),
      );
    }
    const payload = { username: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    return this.createResponse('Login successful', 200, {
      access_token: token,
      user,
    });
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<ResponseFormat<{ user: any; access_token: string }>> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException(
        this.createResponse('Email already in use', 400, null),
      );
    }

    const user = await this.userService.createUser({
      ...registerDto,
    });

    const confirmationToken = generateSixDigitToken();
    await this.sendConfirmationEmail(user, confirmationToken);
    await this.userService.updateUser(user.id, { token: confirmationToken });

    const payload = { username: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return this.createResponse('Registration successful', 201, {
      user,
      access_token: token,
    });
  }

  async resendConfirmationEmail(email: string): Promise<ResponseFormat<null>> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        this.createResponse('Email not found', 400, null),
      );
    }

    const confirmationToken = generateSixDigitToken();
    await this.sendConfirmationEmail(user, confirmationToken);
    await this.userService.updateUser(user.id, { token: confirmationToken });

    return this.createResponse('Confirmation email sent', 200, null);
  }

  private async sendConfirmationEmail(user: any, token: string) {
    await this.mailerService.sendUserConfirmation(user, token);
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<ResponseFormat<null>> {
    const { email, confirmationToken } = verifyEmailDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        this.createResponse('Invalid email', 400, null),
      );
    }

    if (user.token !== confirmationToken) {
      throw new UnauthorizedException(
        this.createResponse('Invalid or expired confirmation token', 401, null),
      );
    }

    user.verified = true;
    user.token = null;

    await this.userService.updateUser(user.id, {
      verified: true,
      token: null,
    });

    return this.createResponse('Email successfully verified', 200, null);
  }

  async startPasswordReset(email: string): Promise<ResponseFormat<null>> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        this.createResponse('Email not found', 400, null),
      );
    }

    const resetToken = generateSixDigitToken();
    await this.userService.updateUser(user.id, { token: resetToken });
    await this.mailerService.sendPasswordReset(user, resetToken);

    return this.createResponse('Password reset email sent', 200, null);
  }

  async endPasswordReset(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseFormat<null>> {
    const { email, resetToken, newPassword } = resetPasswordDto;

    const user = await this.userService.findByEmail(email);
    if (!user || user.token !== resetToken) {
      throw new UnauthorizedException(
        this.createResponse('Invalid reset token', 401, null),
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updateUser(user.id, {
      password: hashedPassword,
      token: null,
    });

    return this.createResponse('Password successfully reset', 200, null);
  }
}
