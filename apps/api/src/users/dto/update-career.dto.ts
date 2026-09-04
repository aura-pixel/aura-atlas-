import { IsString } from "class-validator";

export class UpdateCareerDto {
  @IsString()
  careerId: string;
}