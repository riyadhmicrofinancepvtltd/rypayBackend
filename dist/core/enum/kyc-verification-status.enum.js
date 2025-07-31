"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationStatus = void 0;
var KycVerificationStatus;
(function (KycVerificationStatus) {
    KycVerificationStatus[KycVerificationStatus["NOT_INITIATED"] = 0] = "NOT_INITIATED";
    KycVerificationStatus[KycVerificationStatus["REQUESTED"] = 1] = "REQUESTED";
    KycVerificationStatus[KycVerificationStatus["COMPLETED"] = 2] = "COMPLETED";
    KycVerificationStatus[KycVerificationStatus["REJECTED"] = 3] = "REJECTED";
    KycVerificationStatus[KycVerificationStatus["VERIFIED"] = 4] = "VERIFIED";
})(KycVerificationStatus || (exports.KycVerificationStatus = KycVerificationStatus = {}));
//# sourceMappingURL=kyc-verification-status.enum.js.map