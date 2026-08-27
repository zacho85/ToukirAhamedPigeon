import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CashTransactionDto {
  // Identifies the end user by email -- kept simple for MVP; the agent app's
  // "search user" step is expected to resolve a phone/QR scan down to this.
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmCashOutDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class StartDayDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  startCash: number;
}

export class EndDayDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  endCash: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
