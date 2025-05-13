
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuizzedVariationDto } from './quizzed-variation.dto';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  savedLines?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  recordedLines?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  contributedLines?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  learnedVariations?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  practicedVariations?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizzedVariationDto)
  quizzedVariations?: QuizzedVariationDto[];
}
