import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
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
    transferPin: string;

    
}
export class ChangeTransferPinDto {
  @ApiProperty()
  oldTransferPin: string;

  @ApiProperty()
  newTransferPin: string;
}
