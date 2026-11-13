import { MaxLength as BoundLength } from 'class-validator';
import { IsString } from 'class-validator';

export class UpdateCareerDto {
  @IsString()
  @BoundLength(5000)
  careerId: string;
}
