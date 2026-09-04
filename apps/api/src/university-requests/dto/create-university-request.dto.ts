import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from "class-validator";

import { TeacherType } from "@prisma/client";

export class CreateUniversityRequestDto {
  @IsString()
  @IsNotEmpty()
  universityName!: string;

  @IsString()
  @IsNotEmpty()
  facultyName!: string;

  @IsString()
  @IsNotEmpty()
  careerName!: string;

  @IsEnum(TeacherType)
  teacherType!: TeacherType;
}