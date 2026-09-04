import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

import { UniversitiesModule } from "./universities/universities.module";
import { FacultiesModule } from "./faculties/faculties.module";
import { CareersModule } from "./careers/careers.module";
import { SubjectsModule } from "./subjects/subject.module";
import { UniversityRequestsModule } from "./university-requests/university-requests.module";

import { MaterialModule } from "./material/material.module";
import { HypertextModule } from "./hypertext/hypertext.module";

import {
  AcademicStructureModule,
} from "./academic-structure/academic-structure.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,

    UsersModule,

    AuthModule,

    UniversitiesModule,

    FacultiesModule,

    CareersModule,

    SubjectsModule,

    UniversityRequestsModule,

    AcademicStructureModule,

    MaterialModule,

    HypertextModule,

  ],
})
export class AppModule {}