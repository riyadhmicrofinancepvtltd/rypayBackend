import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
  } from 'class-validator';

export class GenerateUPIRequestDto {
    @ApiProperty()
    customer_name: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsPhoneNumber('IN')
    @IsNotEmpty()
    @ApiProperty()
    phoneNumber: string;


    
}

