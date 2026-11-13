import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TeacherType } from '@prisma/client';
const clean = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.normalize('NFC').trim().replace(/\s+/g, ' ')
    : value;
const officialName = /^[\p{L}\p{N}][\p{L}\p{M}\p{N} .,'’()&/\-]*$/u;
export class CreateUniversityRequestDto {
  @Transform(clean)
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  @Matches(officialName, {
    message:
      'Revisa el nombre oficial de la universidad; usa letras, números y puntuación habitual.',
  })
  universityName!: string;
  @Transform(clean)
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  @Matches(officialName, { message: 'Revisa el nombre de la facultad.' })
  facultyName!: string;
  @Transform(clean)
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  @Matches(officialName, { message: 'Revisa el nombre de la carrera.' })
  careerName!: string;
  @IsOptional()
  @Transform(clean)
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[\p{L}\p{N}][\p{L}\p{N} .\-]*$/u)
  abbreviation?: string;
  @IsOptional() @IsEnum(TeacherType) teacherType?: TeacherType;
}
