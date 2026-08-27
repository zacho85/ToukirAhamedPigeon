import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewFloatRequestDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  notes?: string;
}
