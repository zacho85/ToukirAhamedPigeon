// dto/create-payment-link.dto.ts
import { IsNumber, IsOptional, IsString, IsPositive, Min, IsEmail, IsInt, IsIn } from 'class-validator';
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
  quantity?: number; // For quantity_limited type

  @IsEmail()
  @IsOptional()
  customerEmail?: string;
}