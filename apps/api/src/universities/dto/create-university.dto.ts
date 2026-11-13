import { MaxLength as BoundLength } from 'class-validator';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUniversityDto {
  @IsString()
  @BoundLength(5000)
  @MaxLength(150)
  name: string;

  @IsString()
  @BoundLength(5000)
  @MaxLength(20)
  abbreviation: string;

  @IsOptional()
  @IsString()
  @BoundLength(5000)
  description?: string;
}
