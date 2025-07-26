import { User } from 'src/core/entities/user.entity';
import { UserRequestDto, UserUpdateRequestDto } from '../dto/user-request.dto';
export declare class UserMapper {
    static mapUserRequestDtoToEntity(userRequestDto: UserRequestDto): User;
    static mapUserUpdateRequestDtoToUserEntity(user: User, userRequestDto: UserUpdateRequestDto): User;
    static mapUserUpdateRequestDtoToUserEntityNew(user: User, userRequestDto: UserUpdateRequestDto): User;
    static mapUserRequestDtoToMerchantRegistrationDto(userRequestDto: UserRequestDto, orgId: string): CardIssuanceDto;
}
