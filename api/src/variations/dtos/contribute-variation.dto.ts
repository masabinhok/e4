import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

enum BoardFlip {
  WHITE = 'white',
  BLACK = 'black',
}

export class ContributeVariationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  // Legality is checked in the service by replaying the line with chess.js.
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(10, { each: true })
  moves: string[];

  @IsEnum(BoardFlip)
  boardflip: BoardFlip;
}
