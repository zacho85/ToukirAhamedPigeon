import { IsString, IsNotEmpty } from 'class-validator';

export class AddAirtelMoneyDto {
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