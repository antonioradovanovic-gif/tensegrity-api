import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SendNewsletterDto } from './dto/send-newsletter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Newsletter')
@ApiBearerAuth()
@Controller('newsletter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('send')
  send(@Body() dto: SendNewsletterDto) {
    return this.newsletterService.send(dto);
  }
}
