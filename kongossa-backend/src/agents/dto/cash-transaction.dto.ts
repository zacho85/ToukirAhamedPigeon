import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CashTransactionDto {
  // The customer's KongossaPay ID (KP100001), phone number or email.
  @IsNotEmpty()
  @IsString()
  @MaxLength(254)
  customer: string;

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

export class AgentTransferDto {
  // Each is a KongossaPay ID, phone number or email.
  @IsNotEmpty()
  @IsString()
  @MaxLength(254)
  sender: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(254)
  recipient: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/** A customer starting a cash-out at an agent, from their own app. */
export class CustomerCashOutDto {
  @IsNotEmpty()
  @IsString()
  agentCode: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
