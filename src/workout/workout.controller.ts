import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';
import { RescheduleWorkoutDto } from './dto/reschedule-workout.dto';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@ApiTags('Workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  create(@Body() dto: CreateWorkoutDto, @Req() req: AuthRequest) {
    return this.workoutService.create(dto, req.user.id);
  }

  @Get()
  findAll(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
  ) {
    return this.workoutService.findAll(
      req.user.id,
      req.user.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      dateFrom,
      dateTo,
      category,
      subcategory,
    );
  }

  @Get('dashboard/upcoming')
  getUpcoming(@Req() req: AuthRequest) {
    return this.workoutService.getUpcoming(req.user.id);
  }

  @Get('dashboard/overdue')
  getOverdue(@Req() req: AuthRequest) {
    return this.workoutService.getOverdue(req.user.id);
  }

  @Get('dashboard/history')
  getHistory(@Req() req: AuthRequest) {
    return this.workoutService.getHistory(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.workoutService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutDto,
    @Req() req: AuthRequest,
  ) {
    return this.workoutService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    await this.workoutService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteWorkoutDto,
    @Req() req: AuthRequest,
  ) {
    return this.workoutService.complete(id, dto, req.user.id, req.user.role);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleWorkoutDto,
    @Req() req: AuthRequest,
  ) {
    return this.workoutService.reschedule(id, dto, req.user.id, req.user.role);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.workoutService.cancel(id, req.user.id, req.user.role);
  }
}
