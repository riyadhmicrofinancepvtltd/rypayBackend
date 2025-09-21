"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const address_entity_1 = require("../../core/entities/address.entity");
const merchant_entity_1 = require("../../core/entities/merchant.entity");
const user_entity_1 = require("../../core/entities/user.entity");
const kyc_verification_status_enum_1 = require("../../core/enum/kyc-verification-status.enum");
const hash_util_1 = require("../../core/utils/hash.util");
class UserMapper {
    static mapUserRequestDtoToEntity(userRequestDto) {
        const user = new user_entity_1.User();
        if (userRequestDto.address) {
            const address = new address_entity_1.Address();
            const { address1, address2, city, state, pincode } = userRequestDto.address;
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
        user.referralCode = (0, hash_util_1.generateReferralCode)(user.phoneNumber);
        user.firstName = userRequestDto?.firstName || '';
        user.lastName = userRequestDto?.lastName || '';
        user.fullName = userRequestDto?.fullName;
        user.role = userRequestDto.userType;
        user.aadharNumber = userRequestDto.aadharNumber;
        user.panNumber = userRequestDto.panNumber;
        user.kycVerificationStatus = kyc_verification_status_enum_1.KycVerificationStatus.NOT_INITIATED;
        user.mobileDevices = userRequestDto.fcmToken ? [userRequestDto.fcmToken] : [];
        if (userRequestDto.merchantInfo) {
            const merchantDetails = new merchant_entity_1.Merchant();
            merchantDetails.shopName = userRequestDto.merchantInfo.shopName;
            merchantDetails.gstNumber = userRequestDto.merchantInfo.gstNumber;
            merchantDetails.msmeNumber = userRequestDto.merchantInfo.msmeNumber;
            user.merchant = merchantDetails;
        }
        return user;
    }
    static mapUserUpdateRequestDtoToUserEntity(user, userRequestDto) {
        if (userRequestDto.address) {
            const { address1, address2, city, state, pincode } = userRequestDto.address;
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
        user.kycVerificationStatus = kyc_verification_status_enum_1.KycVerificationStatus[userRequestDto.kycVerificationStatus];
        if (userRequestDto.merchantInfo) {
            const merchantDetails = user.merchant ?? new merchant_entity_1.Merchant();
            merchantDetails.shopName = userRequestDto.merchantInfo.shopName;
            merchantDetails.gstNumber = userRequestDto.merchantInfo.gstNumber;
            merchantDetails.msmeNumber = userRequestDto.merchantInfo.msmeNumber;
            user.merchant = merchantDetails;
        }
        return user;
    }
    static mapUserUpdateRequestDtoToUserEntityNew(user, userRequestDto) {
        if (userRequestDto.address) {
            const { address1, address2, city, state, pincode } = userRequestDto.address;
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
        user.kycVerificationStatus = userRequestDto.kycVerificationStatus;
        if (userRequestDto.merchantInfo) {
            const merchantDetails = user.merchant ?? new merchant_entity_1.Merchant();
            merchantDetails.shopName = userRequestDto.merchantInfo.shopName;
            merchantDetails.gstNumber = userRequestDto.merchantInfo.gstNumber;
            merchantDetails.msmeNumber = userRequestDto.merchantInfo.msmeNumber;
            user.merchant = merchantDetails;
        }
        return user;
    }
    static mapUserRequestDtoToMerchantRegistrationDto(userRequestDto, orgId) {
        return {
            orgId: orgId,
            customer_name: `${userRequestDto.firstName} ${userRequestDto.lastName}`,
            date_of_birth: userRequestDto.dob,
            doc_name: 'PAN',
            doc_number: userRequestDto.panNumber,
            mobile_number: userRequestDto.phoneNumber,
            email: userRequestDto.email,
            gender: userRequestDto.gender,
            addresses: [
                {
                    address1: userRequestDto.address.address1,
                    address2: userRequestDto.address.address2,
                    addressType: 'DELIVERY_ADDRESS',
                    city: userRequestDto.address.city,
                    state: userRequestDto.address.state,
                    pincode: userRequestDto.address.pincode
                }
            ]
        };
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user-mapper.js.map