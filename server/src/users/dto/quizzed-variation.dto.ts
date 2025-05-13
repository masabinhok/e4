import { IsMongoId, IsInt, Min, IsArray, ValidateNested, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// Nested DTO for a single mistake
export class MistakeDto {
  @IsString()
  move: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;
}

export class QuizzedVariationDto {
  @IsMongoId()
  variation: string; // Variation ObjectId as string

  @IsInt()
  @Min(0)
  numberOfAttempts: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MistakeDto)
  mistakes: MistakeDto[];
}
