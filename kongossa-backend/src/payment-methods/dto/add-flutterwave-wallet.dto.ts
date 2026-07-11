import { IsString, IsEmail, IsOptional } from 'class-validator';

export class AddFlutterwaveWalletDto {
  @IsEmail()
  @IsString()
  accountName: string; // email

  @IsOptional()
  @IsString()
  countryCode?: string;
}