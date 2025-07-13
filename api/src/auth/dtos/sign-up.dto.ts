import { IsEmail, IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
