import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export enum ApprovalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ApproveAgentDto {
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status: ApprovalStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}