import { TransformHelper } from '@helpers/transform.helper';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

describe('Transform helper', (): void => {
	describe('To jwt token payload', (): void => {
		const userMock: User = users[4];

		it('should be defined', (): void => {
			expect(TransformHelper.toJwtTokenPayload).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(TransformHelper.toJwtTokenPayload).toBeInstanceOf(Function);
		});

		it('should return only properties from the JWTPayloadDto', (): void => {
			const payload: JWTPayloadDto = TransformHelper.toJwtTokenPayload(userMock);

			expect(payload.id).toBe(userMock.id);
			expect(payload.email).toBe(userMock.email);
			expect(payload.firstName).toBe(userMock.firstName);
			expect(payload.lastName).toBe(userMock.lastName);
			expect(payload.nickname).toBe(userMock.nickname);
		});
	});
});
