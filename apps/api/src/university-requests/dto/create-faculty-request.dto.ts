import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateUniversityRequestDto } from './create-university-request.dto';

export class FacultyRequestFieldsDto extends PickType(
  CreateUniversityRequestDto,
  ['facultyName', 'careerName', 'abbreviation'] as const,
) {}

export class CreateFacultyRequestDto extends FacultyRequestFieldsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  universityId!: string;
}
