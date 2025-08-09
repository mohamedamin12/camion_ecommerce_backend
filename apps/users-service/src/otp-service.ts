import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class OTPService {
  private client: Twilio;
  private verifySid: string;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.verifySid = process.env.TWILIO_VERIFY_SID || "";
  }
  async sendSms(to: string, body: string): Promise<any> {
    console.log('Sending SMS to:', to, 'with body:', body);
    console.log("client:", this.client);
    console.log("twilio phone number:", process.env.TWILIO_PHONE_NUMBER);
    console.log("twilio account sid:", process.env.TWILIO_ACCOUNT_SID);
    console.log("twilio auth token:", process.env.TWILIO_AUTH_TOKEN);


    return this.client.messages.create({
      body,
      to, // recipient
      from: process.env.TWILIO_PHONE_NUMBER, // your Twilio number
    });
  }
  async sendOTP(phone: string): Promise<any> {
    return this.client.verify.v2.services(this.verifySid).verifications.create({
      to: phone,
      channel: 'sms',
    });
  }

  async verifyOTP(phone: string, code: string): Promise<boolean> {
    const result = await this.client.verify.v2
      .services(this.verifySid)
      .verificationChecks.create({
        to: phone,
        code,
      });

    return result.status === 'approved';
  }
}
