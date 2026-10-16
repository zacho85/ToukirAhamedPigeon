import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsNumber()
  transferFeePercent?: number;

  @IsOptional()
  @IsNumber()
  withdrawalFeeFlat?: number;

  @IsOptional()
  @IsNumber()
  forexMarkupPercent?: number;

  @IsOptional()
  @IsNumber()
  cryptoMarkupPercent?: number;

  @IsOptional()
  @IsNumber()
  tontineFeePercent?: number;

  // Platform fees
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  depositFeePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  withdrawalFeePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  p2pFeePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  p2pFreeDailyAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mobileMoneyFeePercent?: number;
}
