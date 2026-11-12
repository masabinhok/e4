import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  // bcrypt ignores everything after 72 bytes.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
