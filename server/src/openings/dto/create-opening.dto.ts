import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CreateVariationDto } from "./create-variation-dto";
import { Type } from "class-transformer";

export class CreateOpeningDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsArray()
  @Type (()=> CreateVariationDto)
  variations?: CreateVariationDto[]; // Array of variations
} 