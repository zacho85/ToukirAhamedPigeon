import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

// PUBLIC: Health/landing route.
@Public()
@ApiTags('Root')
@Controller() // Root controller, handles requests to "/"
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // GET request for "/"
  getHello(): string {
    // Return a simple "Hello World" message
    return this.appService.getHello();
  }
}
