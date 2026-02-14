import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class TransactionHistoryDto {
  @IsOptional()
  @IsString()
  type?: string; // send | receive | deposit | withdrawal

  @IsOptional()
  @IsString()
  status?: string; // completed | pending | failed

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}
