// otp.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Otp')
@ApiBearerAuth('bearer')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  // @UseGuards(JwtAuthGuard) // Optional: remove if you want public access
  async sendOtp(@Body() dto: SendOtpDto) {
    // Extract email and purpose from DTO
    const { email, purpose } = dto;
    return this.otpService.sendOtp(email, purpose);
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    // Extract email, code, purpose from DTO
    const { email, code, purpose } = dto;
    return this.otpService.verifyOtp(email, code, purpose);
  }
}