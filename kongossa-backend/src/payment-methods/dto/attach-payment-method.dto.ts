import { IsString, IsOptional } from "class-validator";

export class AttachPaymentMethodDto {
  @IsString()
  paymentMethodId: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  bankName?: string;
}

