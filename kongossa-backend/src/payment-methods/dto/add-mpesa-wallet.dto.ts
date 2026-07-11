// dto/add-mpesa-wallet.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class AddMpesaWalletDto {
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;
}