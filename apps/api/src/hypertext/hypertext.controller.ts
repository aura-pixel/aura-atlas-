import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import { HypertextService } from "./hypertext.service";

@Controller("hypertexts")
export class HypertextController {
  constructor(
    private readonly hypertextService: HypertextService,
  ) {}

  @Get("public/:slug")
  async findPublic(
    @Param("slug") slug: string,
  ) {
    return this.hypertextService.findPublicBySlug(
      slug,
    );
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  async findOne(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.hypertextService.findOne(
      id,
      req.user.id,
    );
  }

  @Patch(":id/configuration")
  @UseGuards(AuthGuard("jwt"))
  async updateConfiguration(
    @Param("id") id: string,
    @Body()
    body: {
  title?: string;
  description?: string | null;
  coverImageUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  theme?: "LIGHT" | "DARK";
},
    @Req() req: any,
  ) {
    return this.hypertextService.updateConfiguration(
      id,
      body,
      req.user.id,
    );
  }

  @Patch(":id/units/:unitId/image")
  @UseGuards(AuthGuard("jwt"))
  async updateUnitImage(
    @Param("id") id: string,
    @Param("unitId") unitId: string,
    @Body()
    body: {
      imageUrl?: string | null;
    },
    @Req() req: any,
  ) {
    return this.hypertextService.updateUnitImage(
      id,
      unitId,
      body.imageUrl ?? null,
      req.user.id,
    );
  }

  @Post(":id/publish")
  @UseGuards(AuthGuard("jwt"))
  async publish(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.hypertextService.publish(
      id,
      req.user.id,
    );
  }
}
