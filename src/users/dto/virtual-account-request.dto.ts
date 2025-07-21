import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
    IsString, Matches
  } from 'class-validator';

export class VirtualAccountRequestDto {
    @ApiProperty()
    customer_name: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsPhoneNumber('IN')
    @IsNotEmpty()
    @ApiProperty()
    phoneNumber: string;

    @ApiProperty()
    @IsString()
  @Matches(/^\d{6}$/, {
    message: 'transferPin must be exactly 6 digits',
  })
  transferPin: string;

    
}