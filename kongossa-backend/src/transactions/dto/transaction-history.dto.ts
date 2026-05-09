import { IsOptional, IsString, IsNumber, IsDateString, IsIn } from 'class-validator';

export class TransactionHistoryDto {
  @IsOptional()
  @IsString()
  @IsIn(['all', 'topup', 'sent', 'received', 'withdrawal'])
  type?: string = 'all';

  @IsOptional()
  @IsString()
  @IsIn(['all', 'completed', 'pending', 'failed'])
  status?: string = 'all';

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