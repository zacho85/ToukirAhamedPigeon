import { Body, Controller, Post } from '@nestjs/common';
import { PasswordResetsService } from './password-resets.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

// PUBLIC: Forgot/reset password flow — by definition pre-authentication.
@Public()
@ApiTags('Password Resets')
@Controller('password-resets')
export class PasswordResetsController {
  constructor(private readonly service: PasswordResetsService) {}

  @Post('request')
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.service.requestReset(dto);
  }

  @Post('reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }
}
