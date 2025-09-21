import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Length,
  Matches,
  Validate
} from 'class-validator';
import { UserRole } from 'src/core/enum/user-role.enum';
import { MerchantRequestDto } from './merchecnt-request.dto';
import { VirtualAccountRequestDto } from './virtual-account-request.dto'
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';

export class AddressRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @Length(10, 200)
  address1: string;

  @IsNotEmpty()
  @ApiProperty()
  @Length(10, 200)
  address2: string;

  @IsNotEmpty()
  @ApiProperty()
  city: string;

  @IsNotEmpty()
  @ApiProperty()
  state: string;

  @IsNotEmpty()
  @Length(5, 10)
  @ApiProperty()
  pincode: string;
}

export class UserRequestCommonDto {

  @IsNotEmpty()
  @ApiProperty()
  fullName: string;

  @IsOptional()
  @ApiProperty({ description: 'first name' })
  firstName: string;

  @IsOptional()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsIn(['M', 'F'])
  @ApiProperty()
  gender: 'M' | 'F';

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  fcmToken: string;

  @ApiProperty()
  @IsOptional()
  otp: string;

  @ApiProperty()
  @IsOptional()
  otpSessionId: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  dob: string;

  @Validate(AddressRequestDto)
  @ApiProperty()
  @IsNotEmpty()
  address: AddressRequestDto;

  @Validate(VirtualAccountRequestDto)
  @ApiProperty()
  @IsNotEmpty()
  virtualAccount: VirtualAccountRequestDto;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsIn([UserRole.MERCHANT, UserRole.USER])
  @ApiProperty()
  userType: UserRole;

  @ApiProperty()
  @IsOptional()
  @Matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)
  panNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  @Length(12)
  aadharNumber: string;

  @IsOptional()
  @ApiProperty()
  @Validate(MerchantRequestDto)
  merchantInfo: MerchantRequestDto;

  cardHolderId: string

  userSession: string;
}

export class UserRequestDto extends UserRequestCommonDto {
  @IsIn([UserRole.MERCHANT, UserRole.USER])
  @ApiProperty()
  userType: UserRole;

  @ApiProperty()
  referrelCode?: string
}

export class UserAdminRequestDto extends UserRequestCommonDto {
  @IsIn([UserRole.ADMIN])
  @ApiProperty()
  userType: UserRole;
}

export class UserUpdateRequestDto extends UserRequestCommonDto {
  @IsIn([UserRole.MERCHANT, UserRole.USER])
  @ApiProperty()
  userType: UserRole;

  @ApiProperty()
  @IsNotEmpty()
  isBlocked: boolean;

  @ApiProperty()
  @IsNotEmpty()
  kycVerificationStatus: KycVerificationStatus
}

export class UserUpdateResponse {
  @ApiProperty()
  success: boolean
}
export class ValidateOTPAfterCardCreationDTO {
  @IsNotEmpty()
  @ApiProperty()
  otp: string;
}