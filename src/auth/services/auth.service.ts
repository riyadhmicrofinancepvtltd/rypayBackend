import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/core/entities/user.entity';
import { OtpFlowService } from 'src/notifications/services/otp-flow.service';
import {
  UserApiResponseDto,
  UserResponse,
} from 'src/users/dto/user-response.dto';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';
import { OtpRepository } from '../../notifications/repository/otp.repository';
import { VerifyPhoneRequestDto } from '../dto/verify-phone-request.dto';
import { AuthUtil } from '../utils/auth.util';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private otpRepository: OtpRepository,
    private userService: UsersService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  async validateOTP(userPhoneInfo: VerifyPhoneRequestDto) {
    return await this.otpRepository
      .validateUserOtp(userPhoneInfo.phoneNumber, userPhoneInfo.otp)
      .then(async () => {
        return this.getUserData({ fcmToken: userPhoneInfo.fcmToken, phoneNumber: userPhoneInfo.phoneNumber })
      })
      .catch((err) => {
        if (err instanceof InternalServerErrorException) {
          throw new InternalServerErrorException(err.message);
        }
        throw err;
      });
  }
  async validateOTPNew(userPhoneInfo: VerifyPhoneRequestDto) {
    return await this.otpRepository
      .validateUserOtpNew(userPhoneInfo.phoneNumber, userPhoneInfo.otp)
      .then(async () => {
        return this.getUserDataNew({ fcmToken: userPhoneInfo.fcmToken, phoneNumber: userPhoneInfo.phoneNumber })
      })
      .catch((err) => {
        if (err instanceof InternalServerErrorException) {
          throw new InternalServerErrorException([err.message]);
        }
        throw err;
      });
  }
  async getUserDataNew(payload: { fcmToken?: string; phoneNumber?: string; userId?: string; }) {
    const where = payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : { id: payload.userId };
    const userData = await this.userRepo.findOne({
      where: where,
      relations: { address: true, merchant: true, card: true },
    });
    const ALLOWED_PHONE = "8630221258";
    if (!userData && payload.phoneNumber !== ALLOWED_PHONE) {
      return <UserApiResponseDto>{
        success: true,
        message: "Success",
        user: null,
        tokens: null,
      };
    }
    if (userData.isBlocked) {
      throw new BadRequestException(['user is blocked']);
    }
    if (payload.fcmToken) {
      const mobileDevices = userData.mobileDevices ?? [];
      const updatedTokens = Array.from(new Set([...mobileDevices, payload.fcmToken]));
      await this.userRepo.update({ id: userData.id }, { mobileDevices: updatedTokens })
    }
    const tokenPayload =
      AuthUtil.getAccessTokenPayloadFromUserModel(userData);
    const tokens = await this.tokenService.generateTokens(tokenPayload);
    return {
      success: true,
      message: "Success",
      user: await this.userService.addProfileIconInUserResponse(userData, new UserResponse(userData)),
      accessToken: tokens?.accessToken,
    };
  }

  async getUserData(payload: { fcmToken?: string; phoneNumber?: string; userId?: string; }) {
    const where = payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : { id: payload.userId };
    const userData = await this.userRepo.findOne({
      where: where,
      relations: { address: true, merchant: true, card: true },
    });
    const ALLOWED_PHONE = "8630221258";
    if (!userData && payload.phoneNumber !== ALLOWED_PHONE) {
      return <UserApiResponseDto>{
        success: true,
        message: "Success",
        user: null,
        tokens: null,
      };
    }
    if (userData.isBlocked) {
      throw new BadRequestException('user is blocked');
    }
    if (payload.fcmToken) {
      const mobileDevices = userData.mobileDevices ?? [];
      const updatedTokens = Array.from(new Set([...mobileDevices, payload.fcmToken]));
      await this.userRepo.update({ id: userData.id }, { mobileDevices: updatedTokens })
    }
    const tokenPayload =
      AuthUtil.getAccessTokenPayloadFromUserModel(userData);
    const tokens = await this.tokenService.generateTokens(tokenPayload);
    return <UserApiResponseDto>{
      success: true,
      message: "Success",
      user: await this.userService.addProfileIconInUserResponse(userData, new UserResponse(userData)),
      tokens: tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    return this.tokenService.createAccessTokenFromRefreshToken(refreshToken);
  }

  async revokeToken(userId: string) {
    try {
      return this.tokenService.revokeAccessToken(userId);
    } catch {
      throw new InternalServerErrorException(
        'there is some error in revoking user access',
      );
    }
  }
}
