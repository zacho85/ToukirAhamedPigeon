import { 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsPositive, 
  Min, 
  IsEmail, 
  IsInt, 
  IsIn, 
  ValidateIf,
  IsArray,
  IsBoolean,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentLinkDto {
  @IsString()
  @IsIn(['fixed_amount', 'flexible_amount', 'quantity_limited', 'subscription'])
  type: string = 'fixed_amount';

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0.5)
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['USD', 'EUR', 'GBP', 'CAD', 'XAF', 'XOF', 'GHS', 'NGN', 'ZMW'])
  currency?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  expiresInDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  // Subscription fields
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'bi_monthly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom'])
  frequency?: string;

  @ValidateIf(o => o.frequency === 'custom')
  @IsInt()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  customIntervalDays?: number;

  @IsOptional()
  @IsString()
  @IsIn(['recurring', 'fixed_term', 'fixed_payments', 'end_date'])
  durationType?: string;

  @ValidateIf(o => o.durationType === 'fixed_term')
  @IsInt()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  durationMonths?: number;

  @ValidateIf(o => o.durationType === 'fixed_payments')
  @IsInt()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  totalPayments?: number;

  @ValidateIf(o => o.durationType === 'end_date')
  @Type(() => Date)
  endDate?: Date;

  // Multi-currency fields
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'GBP'])
  baseCurrency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCurrencies?: string[];

  @IsOptional()
  @IsBoolean()
  autoConvert?: boolean;
}