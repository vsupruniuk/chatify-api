import { TransformHelper } from '@helpers';

import { User } from '@entities';

import { users } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';

describe('Transform helper', (): void => {
	describe('To jwt token payload', (): void => {
		const userMock: User = users[4];

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
