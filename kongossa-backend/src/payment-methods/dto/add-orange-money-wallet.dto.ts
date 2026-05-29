import { IsString, IsNotEmpty } from 'class-validator';

export class AddOrangeMoneyWalletDto {
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