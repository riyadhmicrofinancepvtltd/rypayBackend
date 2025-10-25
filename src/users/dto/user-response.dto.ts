import { ApiProperty } from '@nestjs/swagger';
import { TokenResponse } from 'src/auth/dto/token-response.dto';
import { Address } from 'src/core/entities/address.entity';
import { Merchant } from 'src/core/entities/merchant.entity';
import { Card } from 'src/core/entities/card.entity';
import { User } from 'src/core/entities/user.entity';
import { Wallet } from 'src/core/entities/wallet.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';


export class VirtualAccountResponse {
  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  ifscCode: string;

  @ApiProperty()
  operator: string;

  @ApiProperty()
  status: string;

  constructor(virtualAccount: any) {
    if (virtualAccount) {
      this.accountNumber = virtualAccount.accountNumber;
      this.ifscCode = virtualAccount.ifscCode;
      this.operator = virtualAccount.operator;
      this.status = virtualAccount.status;
    }
  }
}

export class UPIIdResponse {
  @ApiProperty()
  vpaId: string;

  @ApiProperty()
  upiId: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  upiQr?: string;

  constructor(upi: any) {
    if (upi) {
      this.vpaId = upi.vpaId;
      this.upiId = upi.upiId;
      this.accountNumber = upi.accountnumber;
      this.status = upi.status;
      this.upiQr = upi.upiQr || null;
    }
  }
}

export class CardResponse {
  @ApiProperty()
  cardId: string;
  @ApiProperty()
  lastFourDigit: string;
  @ApiProperty()
  status: string;

  constructor(card: Card) {
    if (card) {
      this.cardId = card.cardNumber;
      this.status = card.status;
      this.lastFourDigit = card.lastFourDigits;
    }
  }
}

export class AccountResponse {
  @ApiProperty()
  accountNumber: string;
  @ApiProperty()
  ifscCode: string;
  @ApiProperty()
  nameInBank: string;
  @ApiProperty()
  upi: string;

  constructor(user: User) {
    if (user) {
      // will get this info from api
      this.accountNumber = '1005896487';
      this.ifscCode = 'YESB012455';
      this.nameInBank = `${user.firstName} ${user.lastName}`;
      this.upi = '8168938167@ptsbi'
    }
  }
}
export class UserResponse {
  @ApiProperty()
  userid: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  dob: string;

  @ApiProperty()
  userRole: string;

  @ApiProperty()
  address: Address;

  @ApiProperty()
  email: string;

  @ApiProperty()
  wallet: Wallet;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  kycVerificationStatus: string;

  @ApiProperty()
  isPinCreated: boolean;

  @ApiProperty()
  cardDetails: CardResponse;

  @ApiProperty()
  profileUrl: String

  @ApiProperty()
  staticQRUrl: String

  @ApiProperty()
  aadharNumber: String

  @ApiProperty()
  panNumber: String

  @ApiProperty()
  merchantPartnerId: String

  @ApiProperty()
  referrelCode: String

  @ApiProperty()
  accountDetails: AccountResponse;

  @ApiProperty()
  merchant: Merchant;

  @ApiProperty({ type: [VirtualAccountResponse], required: false })
  virtualAccounts?: VirtualAccountResponse[];

  @ApiProperty({ type: [UPIIdResponse], required: false })
  upiIds?: UPIIdResponse[];

  constructor(user: User) {
    this.userid = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.fullName;
    this.email = user.email;
    this.dob = user.dob;
    this.userRole = user.role;
    this.address = user.address;
    this.merchant = user.merchant;
    this.aadharNumber = user.aadharNumber;
    this.panNumber = user.panNumber;
    this.isBlocked = !!user.isBlocked;
    this.phoneNumber = user.phoneNumber;
    this.merchantPartnerId = user.merchantPartnerId;
    this.kycVerificationStatus = KycVerificationStatus[user.kycVerificationStatus].toString();
    this.isPinCreated = !!user.pin;
    this.cardDetails = new CardResponse(user.card);
    this.accountDetails = new AccountResponse(user);
    this.referrelCode = user.referralCode;
    // new relations
    this.virtualAccounts = user.virtualAccounts?.map(
      (v) => new VirtualAccountResponse(v),
    ) || [];

    this.upiIds = user.upiIds?.map((u) => new UPIIdResponse(u)) || [];
  }
}

export class AddressDto {}

export class UserApiResponseDto {
  @ApiProperty()
  user: UserResponse;
  @ApiProperty()
  tokens: TokenResponse;
}



