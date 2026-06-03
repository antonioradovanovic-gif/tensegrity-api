import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApproveUserDto } from './dto/approve-user.dto';
import { CreateClientNoteDto } from './dto/client-note.dto';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { SetClientTypeDto } from './dto/set-client-type.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ======================================================
  // REGISTRATION REQUESTS
  // ======================================================

  @Get('users/pending')
  getPendingUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Patch('users/:id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveUserDto) {
    return this.adminService.approveUser(id, dto);
  }

  @Patch('users/:id/reject')
  reject(@Param('id') id: string) {
    return this.adminService.rejectUser(id);
  }

  // ======================================================
  // CLIENT LIST
  // ======================================================

  @Get('clients')
  getClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.adminService.getClients(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      activeFilter,
    );
  }

  // ======================================================
  // CLIENT DETAILS
  // ======================================================

  @Get('clients/:id')
  getClientDetails(@Param('id') id: string) {
    return this.adminService.getClientDetails(id);
  }

  @Get('clients/:id/anamneza')
  getClientAnamneza(@Param('id') id: string) {
    return this.adminService.getClientAnamneza(id);
  }

  @Get('clients/:id/stats')
  getClientStats(@Param('id') id: string) {
    return this.adminService.getClientStats(id);
  }

  @Get('clients/:id/workouts')
  getClientWorkouts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
  ) {
    return this.adminService.getClientWorkouts(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      dateFrom,
      dateTo,
      category,
      subcategory,
    );
  }

  // ======================================================
  // CLIENT MANAGEMENT
  // ======================================================

  @Patch('clients/:id/activate')
  activate(@Param('id') id: string) {
    return this.adminService.setActive(id, true);
  }

  @Patch('clients/:id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.adminService.setActive(id, false);
  }

  @Patch('clients/:id/type')
  setClientType(@Param('id') id: string, @Body() dto: SetClientTypeDto) {
    return this.adminService.setClientType(id, dto);
  }

  @Patch('clients/:id/rehabilitation/toggle')
  toggleRehabilitation(@Param('id') id: string) {
    return this.adminService.toggleRehabilitation(id);
  }

  // ======================================================
  // CLIENT NOTES
  // ======================================================

  @Post('clients/:id/notes')
  createNote(@Param('id') clientId: string, @Body() dto: CreateClientNoteDto) {
    return this.adminService.createNote(clientId, dto);
  }

  @Delete('notes/:noteId')
  deleteNote(@Param('noteId') noteId: string) {
    return this.adminService.deleteNote(noteId);
  }

  // ======================================================
  // PAYMENTS
  // ======================================================

  @Get('clients/:id/payments')
  getPayments(
    @Param('id') clientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPayments(
      clientId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('clients/:id/payments')
  createPayment(@Param('id') clientId: string, @Body() dto: CreatePaymentDto) {
    return this.adminService.createPayment(clientId, dto);
  }

  @Patch('payments/:paymentId')
  updatePayment(
    @Param('paymentId') paymentId: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.adminService.updatePayment(paymentId, dto);
  }

  @Delete('payments/:paymentId')
  deletePayment(@Param('paymentId') paymentId: string) {
    return this.adminService.deletePayment(paymentId);
  }

  // ======================================================
  // CALENDAR
  // ======================================================

  @Get('calendar/birthdays')
  getBirthdayCalendar() {
    return this.adminService.getBirthdayCalendar();
  }

  @Get('calendar/notes')
  getCalendarNotes(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.adminService.getCalendarNotes(dateFrom, dateTo);
  }
}
