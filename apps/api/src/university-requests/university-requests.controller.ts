import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { UniversityRequestsService } from "./university-requests.service";

import { CreateUniversityRequestDto } from "./dto/create-university-request.dto";
import { UpdateUniversityRequestDto } from "./dto/update-university-request.dto";

@Controller("university-requests")
export class UniversityRequestsController {
  constructor(
    private readonly universityRequestsService: UniversityRequestsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateUniversityRequestDto,
  ) {
    // Temporal mientras implementamos autenticación
    const userId = "TEMP_USER_ID";

    return this.universityRequestsService.create(
      userId,
      dto,
    );
  }

  @Get()
  findAll() {
    return this.universityRequestsService.findAll();
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
  ) {
    return this.universityRequestsService.findOne(
      id,
    );
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUniversityRequestDto,
  ) {
    return this.universityRequestsService.update(
      id,
      dto,
    );
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
  ) {
    return this.universityRequestsService.remove(
      id,
    );
  }
}