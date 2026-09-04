import {
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateUniversityDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(20)
  abbreviation: string;

  @IsOptional()
  @IsString()
  description?: string;
}