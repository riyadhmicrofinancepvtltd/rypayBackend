import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsMobilePhone, IsNotEmpty, IsOptional } from "class-validator"

export class AccountPayoutPayload {
    @ApiProperty()
    @IsNotEmpty()
    accountNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    ifsc: string;

    @ApiProperty()
    @IsNotEmpty()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsMobilePhone('en-IN')
    mobile: string

    @ApiProperty()
    @IsNotEmpty()
    @IsIn(['IMPS', 'RTGS', 'NEFT'])
    mode: string

    @ApiProperty()
    message: string

    @ApiProperty()
    @IsOptional()
    userName: string

    @ApiProperty()
    convenienceFee:number
}
