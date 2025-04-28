import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BoardFlip } from "../schemas/variation.schema";

export class CreateVariationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  moves: string[]; // Array of moves in the variation, e.g., ["e4", "c6", "d4", "d5", "e5"]

  @IsOptional()
  @IsNumber()
  index: number;

  @IsString()
  @IsNotEmpty()
  description: string; // Optional description of the variation

  @IsOptional()
  @IsEnum(BoardFlip)
  boardflip?: "white" | "black"; // Indicates which side the board is flipped for the variation
}