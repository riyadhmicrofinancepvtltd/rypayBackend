import { Body, Controller, Delete, Get, HttpCode, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/core/entities/user.entity';
import { KycVerificationStatus } from 'src/core/enum/kyc-verification-status.enum';
import { KycVerificationStatusResponse } from '../dto/kyc-status.dto';
import { PhoneNumberExists } from '../dto/phone-number-exists.dto';
import { PinRequestDto, UpdateForgotPin } from '../dto/pin-request.dto';
import { VirtualAccountRequestDto } from "../dto/virtual-account-request.dto"
import { ChangeTransferPinDto } from "../dto/virtual-account-request.dto"
import { UpdateKycDetailUploadDto } from '../dto/user-kyc-upload.dto';
import { UserAdminRequestDto, UserRequestDto, UserUpdateRequestDto, ValidateOTPAfterCardCreationDTO } from '../dto/user-request.dto';
import { UserApiResponseDto, UserResponse } from '../dto/user-response.dto';
import { ValidateAadharDto } from '../dto/validate-aadhar.dto';
import { UploadFileService } from '../services/updaload-file.service';
import { UsersService } from '../services/users.service';
import { StaticQRDTO } from '../dto/static-qr.dto';

@Controller('user')
@ApiTags('User')
export class UsersController {
  constructor(private userService: UsersService, private uploadFileService: UploadFileService) { }

  @ApiOperation({ summary: 'Endpoint to register the user' })
  @Post('/signup')
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserApiResponseDto,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async register(
    @Body() signUpDto: UserRequestDto,
  ): Promise<UserApiResponseDto> {
    return this.userService.registerUserAndGenerateToken(signUpDto);
  }

  @ApiOperation({ summary: 'Endpoint to register the user' })
  @Post('/new-signup')
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserApiResponseDto,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async registerNew(
    @Body() signUpDto: UserRequestDto,
  ): Promise<UserApiResponseDto> {
    return this.userService.registerUserAndGenerateTokenNew(signUpDto);
  }





  @ApiOperation({ summary: 'Endpoint to request the aadhar otp' })
  @Post('/request-aadhar-otp/:aadharNumber')
  @ApiParam({
    type: 'string',
    name: 'aadharNumber'
  })
  async requestAadharOtp(
    @Param('aadharNumber') aadharNumber: string
  ): Promise<any> {
    return this.userService.requestAadharOtp(aadharNumber);
  }

  @ApiOperation({ summary: 'Endpoint to validate the aadhar otp' })
  @Post('/validate-aadhar-otp')
  async validateAadharOtp(
    @Body() body: ValidateAadharDto
  ): Promise<string> {
    return this.userService.validateAadharOtp(body);
  }

  @ApiOperation({ summary: 'Endpoint to delete the user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserApiResponseDto,
    description: 'The record has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'forbidden exception',
  })
  async deleteUser(
    @Req() req: any
  ): Promise<string> {
    return this.userService.deleteUser(req.user.sub);
  }

  @ApiOperation({ summary: 'Get current user details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({
    status: 200,
    description: 'User details fetched successfully',
    //type: UserEntity, // Or a DTO if you're using one
  })
  async getUserDetail(@Req() req: any): Promise<any> {
    return this.userService.getUserDetail(req.user.sub);
  }


  @ApiOperation({ summary: 'Endpoint to register the user as Admin' })
  @Post('/signup/admin')
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserApiResponseDto,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async registerAdmin(
    @Body() signUpDto: UserAdminRequestDto,
  ): Promise<UserApiResponseDto> {
    return this.userService.registerAdminAndGenerateToken(signUpDto);
  }

  @ApiOperation({ summary: 'Endpoint to update user profile' })
  @Post('/update/user/:userId')
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateDto: UserUpdateRequestDto,
  ): Promise<User> {
    return this.userService.updateUserProfile(userId,updateDto);
  }

  @ApiOperation({ summary: 'Endpoint to get all users' })
  @Post('/list')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({ 
    status: HttpStatus.OK,
    type: [UserResponse],
    description: 'The record has been successfully retrieved.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async getAllUser(
    @Req() req: any,
    @Query('search') search
  ): Promise<UserResponse[]> {
    return this.userService.getAllUsers(req.user.sub, search);
  }

  @ApiOperation({ summary: 'Endpoint to check phone number exist' })
  @Post('/exist/:phoneNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ 
    status: HttpStatus.OK,
    type: PhoneNumberExists,
    description: 'Returns if phone number exist.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async checkUserExist(
    @Param('phoneNumber') phoneNumber: string
  ): Promise<PhoneNumberExists> {
    return this.userService.checkPhoneNumberExists(phoneNumber);
  }

  @Put('update-profile-icon')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile icon' })
  @ApiResponse({ status: 200, description: 'Profile icon updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
      description: 'File to upload and user ID',
      type: 'multipart/form-data',
      schema: {
          type: 'object',
          properties: {
              file: {
                  type: 'string',
                  format: 'binary',
              }
          },
      },
  })
  async updateProfileIcon(@UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({
        maxSize: (10 * 1024 * 1024), // 1MB
        message: 'File is too large. Max file size is 10MB',
      }),
    ],
    fileIsRequired: true,
  })) file: Express.Multer.File, @Req() req: any) {
      return this.userService.updateProfileIcon(req.user.sub, file);
  }

@Put('update-static-qr/:userId')
@UseInterceptors(FileInterceptor('file'))
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiOperation({ summary: 'Update static QR' })
@ApiResponse({ status: 200, description: 'Static QR uploaded successfully.' })
@ApiResponse({ status: 400, description: 'Bad Request.' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'File to upload, user ID, and merchant ID',
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
      merchantId: {
        type: 'string',
      },
    },
  },
})
async updateStaticQR(
  @Param('userId') userId: string,
  @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({
        maxSize: 10 * 1024 * 1024, // 10MB
        message: 'File is too large. Max file size is 10MB',
      }),
    ],
    fileIsRequired: true,
  })) file: Express.Multer.File,
  @Body('merchantId') merchantId: string
) {
  return this.userService.updateStaticQR(userId, merchantId, file);
}


  @Post('set-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async setPin(
    @Req() req: any,
    @Body() pinRequest: PinRequestDto,
  ): Promise<{ message: string; }> {
    await this.userService.setPin(req.user.sub, pinRequest.pin);
    return {
      message: 'pin created successfully'
    };
  }

  @Post('create-virtual-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async createVirtualAccount(
    @Req() req: any,
    @Body() virtualRequest: VirtualAccountRequestDto,
  ): Promise<{ message: string; }> {
    let data = await this.userService.createVirtualAccount(req.user.sub, virtualRequest.customer_name,virtualRequest.email,virtualRequest.phoneNumber,virtualRequest.transferPin);
    return data;
  }
  @Get('get-virtual-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async getVirtualAccount(
    @Req() req: any,
  ): Promise<{ message: string; }> {
    let data = await this.userService.getVirtualAccount(req.user.sub);
    return data;
  }
  @Post('change-transfer-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async changeTransferPin(
    @Req() req: any,
    @Body() changeTransferPinDto: ChangeTransferPinDto,
  ): Promise<{ message: string; }> {
    let data = await this.userService.changeTransferPin(req.user.sub, changeTransferPinDto);
    return data;
  }

  @Post('verify-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async verifyPin(
    @Req() req: any,
    @Body() pinRequest: PinRequestDto,
  ): Promise<{ valid: boolean; }> {
    const valid = await this.userService.verifyPin(req.user.sub, pinRequest.pin);
    return { valid };
  }

    @Post('reset-pin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Request PIN reset' })
    @ApiResponse({ status: 200, description: 'Verification code sent to user.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async requestResetPin(@Req() req: any) {
        await this.userService.sendVerificationCode(req.user.sub);
        return { message: 'Verification code sent to your email.' };
  }

  @Post('forgot/update-pin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'updates pin' })
  @ApiResponse({ status: 200, description: 'Code verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid code or expired.' })
  async updateForgotPin(@Req() req: any, @Body() body: UpdateForgotPin) {
      return await this.userService.verifyCodeAndUpdateUserPin(req.user.sub, body.otp, body.newPin);
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to initiate kyc of the user' })
  @Put('/kyc-status')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: 'string',
    description: 'The record has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async updateKYC(
    @Req() req: any, kycStatus: keyof typeof KycVerificationStatus
  ): Promise<string> {
    return this.userService.updateUserKycStatus(req.user.sub, kycStatus);
  }

  @ApiOperation({ summary: 'Endpoint to get list of users based on kyc status' })
  @Get('/kyc/:kycStatus')
  @ApiParam({ name: 'kycStatus', type: 'string' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: Array<UserResponse>,
    description: 'The list of users based on given kyc status.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async getKYCInitiatedUsers(
    @Param('kycStatus') kycStatus: keyof typeof KycVerificationStatus
  ): Promise<UserResponse[]> {
    return this.userService.getUsersByKycStatus(kycStatus);
  }

  @ApiOperation({ summary: 'Endpoint to get Static QR code' })
  @Get('/staticQR')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'get Static QR code.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async getUserStaticQR(
    @Req() req: any
  ): Promise<StaticQRDTO> {
    return this.userService.getUserStaticQR(req.user.sub);
  }

  @ApiOperation({ summary: 'Endpoint to get kyc status of user' })
  @Get('/kyc')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: KycVerificationStatusResponse,
    description: 'The kyc status of user.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Forbidden.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request exception',
  })
  async getKycStatusOfUser(
    @Req() req: any
  ): Promise<KycVerificationStatusResponse> {
    const status = await this.userService.getKycStatusOfUser(req.user.sub);
    return {
      status
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Endpoint to validate otp for card after card creation' })
  @Post('/validate/card')
  async validateCard(@Req() req: any, @Body() otpRequest: ValidateOTPAfterCardCreationDTO) {
    const cardDetails = await this.userService.validateUserCardAssignment(req.user.sub, otpRequest.otp);
    return {
      isVerified: true,
      cardDetails
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Endpoint to get my documents' })
  @Get('/documents')
  async getMyDocuments(@Req() req: any) {
    const userDocuments = await this.userService.getUserDocuments(req.user.sub);
    return {
      data: userDocuments
    };
  }

  @Post('/upload/documents')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Endpoint to upload user documents /n Max size of the file is 10 MB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: (10 * 1024 * 1024), // 1MB
            message: 'File is too large. Max file size is 10MB',
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File
  ) {
    const fileData = await this.uploadFileService.uploadSingleFile(file);
    return fileData;
  }

  @Get(':userid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Endpoint to get user profile data, ADMIN' })
  @ApiParam({ name: 'id', type: String, description: 'Unique ID of the user' }) // Describing the ID parameter
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    type: UserResponse, // Documenting the response type
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserProfile(
    @Param('userid') userId: string
  ) {
    const fileData = await this.userService.getUserProfile(userId);
    return fileData;
  }

  @Post('/KYC/document')
  @ApiOperation({ summary: 'Update KYC documents for users' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    description: 'Array of KYC document update information',
    type: [UpdateKycDetailUploadDto],
  })
  @ApiResponse({ status: 200, description: 'Documents updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateKYCDocument(
    @Req() req: any,
    @Body() userDocsInfo: UpdateKycDetailUploadDto[]
  ) {
    const fileData = await this.userService.updateUserKycDetails(req.user.sub, userDocsInfo);
    return {
      success: !!fileData
    };
  }
}
