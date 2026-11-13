import {
  MaxLength,
  IsByteLength,
  IsString as StringValue,
  MinLength as PasswordLength,
} from 'class-validator';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsNotEmpty()
  @StringValue()
  @PasswordLength(1)
  @MaxLength(72)
  @IsByteLength(0, 72)
  password: string;
}
