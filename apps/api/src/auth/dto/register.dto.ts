import {
  MaxLength,
  IsByteLength,
  IsString as StringValue,
  MinLength as PasswordLength,
} from 'class-validator';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';

import { TeacherType } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @StringValue()
  @PasswordLength(12)
  @MaxLength(72)
  @IsByteLength(0, 72)
  password!: string;

  @IsEnum(TeacherType)
  @IsOptional()
  teacherType?: TeacherType;
}
