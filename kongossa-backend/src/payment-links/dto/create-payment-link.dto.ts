import { IsNumber, IsOptional, IsString, IsPositive, Min, IsEmail, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentLinkDto {
  @IsNumber()
  @IsPositive()
  @Min(0.5)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  currency?: string; // default USD

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  expiresInDays?: number; // optional: 1,2,3,7 (default 7)

  @IsEmail()
  @IsOptional()
  customerEmail?: string; // pre-fill email on checkout
}

export class PaymentLinkResponseDto {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  paymentUrl: string;
  expiresAt: Date | null;
  createdAt: Date;
  stripeCheckoutUrl: string | null;
}