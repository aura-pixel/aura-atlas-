import { Throttle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UniversityRequestsService } from './university-requests.service';
import { CreateUniversityRequestDto } from './dto/create-university-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminOnly, RolesGuard } from '../security/access';
import { ReviewRequestDto } from '../security/dto';
import {
  CreateFacultyRequestDto,
  FacultyRequestFieldsDto,
} from './dto/create-faculty-request.dto';
@Controller('university-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UniversityRequestsController {
  constructor(private readonly service: UniversityRequestsService) {}
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(@Req() req: any, @Body() dto: CreateUniversityRequestDto) {
    return this.service.create(req.user.id, dto);
  }
  @Post('faculties')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  createFaculty(@Req() req: any, @Body() dto: CreateFacultyRequestDto) {
    return this.service.createFaculty(req.user.id, dto);
  }
  @Patch(':id/resubmit-faculty')
  resubmitFaculty(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: FacultyRequestFieldsDto,
  ) {
    return this.service.resubmitFaculty(id, req.user.id, dto);
  }
  @Get() findAll(@Req() req: any) {
    return this.service.findAll(req.user);
  }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }
  @Patch(':id/resubmit')
  resubmit(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: CreateUniversityRequestDto,
  ) {
    return this.service.resubmit(id, req.user.id, dto);
  }
  @Patch(':id') @AdminOnly() update(
    @Param('id') id: string,
    @Body() dto: ReviewRequestDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') @AdminOnly() remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
