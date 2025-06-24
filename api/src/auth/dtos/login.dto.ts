import {
  IsEmail,
  IsPassportNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
