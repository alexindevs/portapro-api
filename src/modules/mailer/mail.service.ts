import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(user: any, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to PortaPro! Confirm your Email',
      template: './confirmation', // Points to the confirmation.hbs file in the templates folder
      context: {
        name: user.firstName, // Replace with dynamic values in the template
        token, // You can pass a token or any other variables
      },
    });
  }

  async sendPasswordReset(user: any, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      template: './reset-password', // Points to reset-password.hbs
      context: {
        name: user.firstName,
        token,
      },
    });
  }
}
