import { IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
