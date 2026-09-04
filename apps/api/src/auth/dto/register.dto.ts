import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from "class-validator";

import { TeacherType } from "@prisma/client";

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(TeacherType)
  teacherType!: TeacherType;
}