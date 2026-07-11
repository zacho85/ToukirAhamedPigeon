import { IsString, IsEmail, IsOptional } from 'class-validator';

export class AddPaystackWalletDto {
  @IsEmail()
  @IsString()
  accountName: string; // email

  @IsOptional()
  @IsString()
  countryCode?: string;
}