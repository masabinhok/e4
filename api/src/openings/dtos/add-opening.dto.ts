import { IsString } from "class-validator";

export class AddOpeningDto {
  @IsString()
  name: string; 

  @IsString()
  code: string;

  @IsString()
  description: string;
}