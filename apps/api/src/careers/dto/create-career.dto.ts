import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateCareerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsString()
  @IsNotEmpty()
  facultyId!: string;
}