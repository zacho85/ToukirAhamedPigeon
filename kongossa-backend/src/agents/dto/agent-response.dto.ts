import { Expose, Transform } from 'class-transformer';

export class AgentResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  agentCode: string;

  @Expose()
  agentType: string;

  @Expose()
  businessName: string;

  @Expose()
  kycStatus: string;

  @Expose()
  status: string;

  @Expose()
  commissionRate: number;

  @Expose()
  cashOnHand: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.user?.fullName)
  fullName?: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.email)
  email?: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.phoneNumber)
  phoneNumber?: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.walletBalance)
  walletBalance?: number;

  @Expose()
  @Transform(({ obj }) => obj.approvedByUser?.fullName)
  approvedByName?: string;

  @Expose()
  approvedAt?: Date;
}