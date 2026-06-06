// dto/create-payment-link.dto.ts - FULL UPDATED VERSION
import { 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsPositive, 
  Min, 
  Max,
  IsEmail, 
  IsInt, 
  IsIn, 
  ValidateIf,
  MinDate
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentLinkDto {
  @IsString()
  @IsIn(['fixed_amount', 'flexible_amount', 'quantity_limited', 'subscription'])
  type: string = 'fixed_amount';

  // Amount fields
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
  currency?: string;

  // Expiry
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  expiresInDays?: number;

  // Quantity limited fields
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity?: number;

  // Customer email
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  // ========== NEW SUBSCRIPTION FIELDS ==========
  
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
  @MinDate(new Date())
  endDate?: Date;
}