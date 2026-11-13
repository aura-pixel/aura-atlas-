import { MaxLength as BoundLength } from 'class-validator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @BoundLength(5000)
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  @BoundLength(5000)
  abbreviation?: string;

  @IsOptional()
  @IsString()
  @BoundLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @BoundLength(5000)
  color?: string;

  @IsString()
  @BoundLength(5000)
  @IsNotEmpty()
  universityId!: string;
}
