import { IsArray, IsEnum, IsString } from 'class-validator';

enum BoardFlip {
  WHITE = 'white',
  BLACK = 'black',
}

export class ContributeVariationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  moves: string[];

  @IsEnum(BoardFlip)
  boardflip: BoardFlip;
}
