import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class SetRateDto {
  @IsString()
  @Length(3, 3)
  from: string;

  @IsString()
  @Length(3, 3)
  to: string;

  @IsNumber()
  @IsPositive()
  rate: number;
}
