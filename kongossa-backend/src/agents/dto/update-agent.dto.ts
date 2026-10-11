import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateCommissionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number;
}

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCashOnHand?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyTransactionLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyTransactionLimit?: number;
}
/** Admin-only: any subset of an agent's transaction limits. */
export class UpdateAgentLimitsDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  dailyTransactionLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  monthlyTransactionLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxTransactionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxCashOnHand?: number;
}

export class UpdateOtpThresholdDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  value: number;
}
