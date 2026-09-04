import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { UpdateCareerDto } from "./dto/update-career.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch("me/career")
  @UseGuards(JwtAuthGuard)
  async updateCareer(
    @Req() req: any,
    @Body() dto: UpdateCareerDto,
  ) {
    return this.usersService.setCareer(
      req.user.id,
      dto.careerId,
    );
  }
}