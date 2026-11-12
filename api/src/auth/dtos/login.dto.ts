import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  // No MinLength here: accounts created before the 8-character rule must still log in.
  @IsString()
  @MaxLength(72)
  password: string;
}
