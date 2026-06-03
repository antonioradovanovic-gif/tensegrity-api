import { Controller, Get, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { AnamnesaDto } from './dto/anamneza.dto';
import { WeeklyGoalDto } from './dto/weekly-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.userService.getMe(req.user.id);
  }

  @Patch('me/onboarding')
  completeOnboarding(@Req() req: AuthRequest, @Body() dto: OnboardingDto) {
    return this.userService.completeOnboarding(req.user.id, dto);
  }

  @Post('me/anamneza')
  submitAnamneza(@Req() req: AuthRequest, @Body() dto: AnamnesaDto) {
    return this.userService.submitAnamneza(req.user.id, dto);
  }

  @Get('me/anamneza')
  getAnamneza(@Req() req: AuthRequest) {
    return this.userService.getAnamneza(req.user.id);
  }

  @Post('me/finish-onboarding')
  finishOnboarding(@Req() req: AuthRequest) {
    return this.userService.finishOnboarding(req.user.id);
  }

  @Patch('me/weekly-goal')
  setWeeklyGoal(@Req() req: AuthRequest, @Body() dto: WeeklyGoalDto) {
    return this.userService.setWeeklyGoal(req.user.id, dto);
  }

  @Get('me/stats')
  getStats(@Req() req: AuthRequest) {
    return this.userService.getStats(req.user.id);
  }

  @Patch('me')
  updateProfile(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Patch('me/password')
  changePassword(@Req() req: AuthRequest, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, dto);
  }

  @Get('community/dashboard')
  getCommunityDashboard() {
    return this.userService.getCommunityDashboard();
  }
}
