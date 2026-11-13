import {
  IsInt,
  IsMongoId,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class AskCoachDto {
  @IsMongoId()
  variationId: string;

  @IsInt()
  @Min(0)
  @Max(300)
  index: number;

  // A SAN move, checked for legality in the service.
  @IsOptional()
  @Matches(/^[KQRBNa-h1-8xO=+#-]{2,7}$/)
  played?: string;
}
