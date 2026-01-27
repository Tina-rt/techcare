import { Injectable } from '@nestjs/common';

@Injectable()
export class MailSenderService {
  private async sendMail(to: string, subject: string, body: string): Promise<void> {
    // Placeholder for actual mail sending logic
    console.log(`Sending mail to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    // Here you would integrate with an email service provider
  }
  
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const subject = ''
  }

}
