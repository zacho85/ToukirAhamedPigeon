import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  MinLength, 
  MaxLength,
  IsPhoneNumber,
  IsNotEmpty
} from 'class-validator';

export enum AgentType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum IdType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVERS_LICENSE = 'drivers_license',
}

export class RegisterAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsEnum(AgentType)
  @IsNotEmpty()
  agentType: AgentType;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsEnum(IdType)
  @IsNotEmpty()
  idType: IdType;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  idFrontImage?: string;

  @IsOptional()
  @IsString()
  idBackImage?: string;

  @IsOptional()
  @IsString()
  selfieImage?: string;

  @IsOptional()
  @IsString()
  addressProofImage?: string;
}