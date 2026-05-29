import { IsString, IsNotEmpty } from 'class-validator';

export class AddMoMoWalletDto {
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