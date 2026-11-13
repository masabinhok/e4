import { IsInt, Max, Min } from 'class-validator';

export class RecordProgressDto {
  // Wrong moves plus hints used during the drill.
  @IsInt()
  @Min(0)
  @Max(500)
  mistakes: number;
}
