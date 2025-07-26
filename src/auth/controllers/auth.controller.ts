import {
  Body,
  Controller,
  ExecutionContext,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VerifyPhoneRequestDto } from '../dto/verify-phone-request.dto';
import { sendOtpResponseDto } from '../../notifications/dto/send-otp-response.dto';
import { UserApiResponseDto } from 'src/users/dto/user-response.dto';
import { sendOtpRequestDto } from '../../notifications/dto/send-otp-request.dto';
import { RefreshAccessTokenResponseDto } from '../dto/refresh-access-token-request.dto';
import { RefreshAccessTokenRequestDto } from '../dto/refresh-access-token-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRole } from 'src/core/enum/user-role.enum';
import { OtpFlowService } from 'src/notifications/services/otp-flow.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService,
    private otpFlowService: OtpFlowService
  ) {}

  @ApiResponse({ type: sendOtpResponseDto })
  @HttpCode(HttpStatus.OK)
  @Post('request-otp')
  @ApiBody({
    required: true,
    type: sendOtpRequestDto,
  })
  async requestOtp(@Body() userPhone: sendOtpRequestDto) {
    return this.otpFlowService.requestOtp(userPhone.phone);
  }

  @ApiResponse({ type: UserApiResponseDto })
  @Post('validate-otp')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    required: true,
    type: VerifyPhoneRequestDto,
  })
  async validateOtp(@Body() userPhone: VerifyPhoneRequestDto) {
    return this.authService.validateOTP(userPhone);
  }

  @ApiResponse({ type: UserApiResponseDto })
  @Post('validate-otp-new')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    required: true,
    type: VerifyPhoneRequestDto,
  })
  async validateOtpNew(@Body() userPhone: VerifyPhoneRequestDto) {
    return this.authService.validateOTPNew(userPhone);
  }

  @ApiResponse({ type: UserApiResponseDto })
  @Post('user')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserResponse(@Req() req: any) {
    return this.authService.getUserData({userId: req.user.sub});
  }

  @ApiResponse({ type: RefreshAccessTokenResponseDto })
  @Post('refresh-access-token')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    required: true,
    type: RefreshAccessTokenRequestDto,
  })
  async refreshAccessToken(
    @Body() refreshTokenDto: RefreshAccessTokenRequestDto,
  ) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @ApiResponse({ type: RefreshAccessTokenResponseDto })
  @Post('logout/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    required: true,
    type: RefreshAccessTokenRequestDto,
  })
  async logout(@Param('id') id: string, @Req() request) {
    const user = request.user;
    if (user.role === UserRole.ADMIN || user.sub?.toString() === id) {
      return this.authService.revokeToken(id);
    }
    throw new UnauthorizedException('user does not have enough permissions');
  }
}
