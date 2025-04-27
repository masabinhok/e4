import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BoardFlip } from "../schemas/variation.schema";

export class CreateVariationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  moves: string[]; // Array of moves in the variation, e.g., ["e4", "c6", "d4", "d5", "e5"]

  @IsString()
  @IsNotEmpty()
  description: string; // Optional description of the variation

  @IsOptional()
  @IsEnum(BoardFlip)
  boardflip?: "white" | "black"; // Indicates which side the board is flipped for the variation
}