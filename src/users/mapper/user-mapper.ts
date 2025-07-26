import { Address } from 'src/core/entities/address.entity';
import { Merchant } from 'src/core/entities/merchant.entity';
import { User } from 'src/core/entities/user.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';
import { UserRequestDto, UserUpdateRequestDto } from '../dto/user-request.dto';
import { generateReferralCode } from 'src/core/utils/hash.util';

export class UserMapper {
  static mapUserRequestDtoToEntity(userRequestDto: UserRequestDto) {
    const user = new User();
    if (userRequestDto.address) {
      const address = new Address();
      const { address1, address2, city, state, pincode } =
        userRequestDto.address;
      address.address1 = address1;
      address.address2 = address2;
      address.city = city;
      address.state = state;
      address.pincode = pincode;
      user.address = address;
    }
    user.dob = userRequestDto.dob;
    user.gender = userRequestDto.gender;
    user.cardHolderId = userRequestDto.cardHolderId;
    user.phoneNumber = userRequestDto.phoneNumber;
    user.email = userRequestDto.email;
    user.referralCode = generateReferralCode(user.phoneNumber);
    user.firstName = userRequestDto.firstName;
    user.lastName = userRequestDto.lastName;
    user.role = userRequestDto.userType;
    user.aadharNumber = userRequestDto.aadharNumber;
    user.panNumber = userRequestDto.panNumber;
    user.kycVerificationStatus = KycVerificationStatus.NOT_INITIATED;
    user.mobileDevices = userRequestDto.fcmToken ? [userRequestDto.fcmToken] : [];
    if (userRequestDto.merchantInfo) {
      const merchantDetails = new Merchant();
      merchantDetails.shopName = userRequestDto.merchantInfo.shopName;
      merchantDetails.gstNumber = userRequestDto.merchantInfo.gstNumber;
      merchantDetails.msmeNumber = userRequestDto.merchantInfo.msmeNumber;
      user.merchant = merchantDetails;
    }
    return user;
  }

  static mapUserUpdateRequestDtoToUserEntity(user: User, userRequestDto: UserUpdateRequestDto) {
    if (userRequestDto.address) {
      const { address1, address2, city, state, pincode } =
        userRequestDto.address;
      const address = user.address;
      address.address1 = address1;
      address.address2 = address2;
      address.city = city;
      address.state = state;
      address.pincode = pincode;
      user.address = address;
    }
    user.dob = userRequestDto.dob;
    user.gender = userRequestDto.gender;
    user.isBlocked = userRequestDto.isBlocked;
    user.phoneNumber = userRequestDto.phoneNumber;
    user.email = userRequestDto.email;
    user.firstName = userRequestDto.firstName;
    user.lastName = userRequestDto.lastName;
    user.role = userRequestDto.userType;
    user.aadharNumber = userRequestDto.aadharNumber;
    user.panNumber = userRequestDto.panNumber;
    user.kycVerificationStatus = KycVerificationStatus[userRequestDto.kycVerificationStatus] as any;
    if (userRequestDto.merchantInfo) {
      const merchantDetails = user.merchant ?? new Merchant();
      merchantDetails.shopName = userRequestDto.merchantInfo.shopName;
      merchantDetails.gstNumber = userRequestDto.merchantInfo.gstNumber;
      merchantDetails.msmeNumber = userRequestDto.merchantInfo.msmeNumber;
      user.merchant = merchantDetails;
    }
    return user;
  }
  static mapUserUpdateRequestDtoToUserEntityNew(user: User, userRequestDto: UserUpdateRequestDto) {
    if (userRequestDto.address) {
      const { address1, address2, city, state, pincode } =
        userRequestDto.address;
      const address = user.address;
      address.address1 = address1;
      address.address2 = address2;
      address.city = city;
      address.state = state;
      address.pincode = pincode;
      user.address = address;
    }
    user.dob = userRequestDto.dob;
    user.gender = userRequestDto.gender;
    user.isBlocked = userRequestDto.isBlocked;
    user.email = userRequestDto.email;
    user.firstName = userRequestDto.firstName;
    user.lastName = userRequestDto.lastName;
    user.aadharNumber = userRequestDto.aadharNumber;
    user.panNumber = userRequestDto.panNumber;
    user.kycVerificationStatus = KycVerificationStatus[userRequestDto.kycVerificationStatus] as any;
    if (userRequestDto.merchantInfo) {
      const merchantDetails = user.merchant ?? new Merchant();
      merchantDetails.shopName = userRequestDto.merchantInfo.shopName;
      merchantDetails.gstNumber = userRequestDto.merchantInfo.gstNumber;
      merchantDetails.msmeNumber = userRequestDto.merchantInfo.msmeNumber;
      user.merchant = merchantDetails;
    }
    return user;
  }

  static mapUserRequestDtoToMerchantRegistrationDto(userRequestDto: UserRequestDto, orgId: string): CardIssuanceDto {
    return {
      orgId: orgId,
      customer_name: `${userRequestDto.firstName} ${userRequestDto.lastName}`,
      date_of_birth: userRequestDto.dob,
      doc_name: 'PAN', // will use PAN for now
      doc_number: userRequestDto.panNumber,
      mobile_number: userRequestDto.phoneNumber,
      email: userRequestDto.email,
      gender: userRequestDto.gender,
      addresses: [
        {
          address1: userRequestDto.address.address1,
          address2: userRequestDto.address.address2,
          addressType: 'DELIVERY_ADDRESS', // this will contain single value
          city: userRequestDto.address.city,
          state: userRequestDto.address.state,
          pincode: userRequestDto.address.pincode
        }
      ]
    }
  }
}
