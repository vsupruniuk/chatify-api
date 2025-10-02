import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { firstValueFrom, of } from 'rxjs';

import { ResponseTransformInterceptor } from '@interceptors';

import { User } from '@entities';

import { users } from '@testMocks';

import { UserDto } from '@dtos/users';

import { SuccessfulResponseResult } from '@responses/successfulResponses';

import { ResponseStatus } from '@enums';

describe('Response transform interceptor', (): void => {
	let responseTransformInterceptor: ResponseTransformInterceptor;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [ResponseTransformInterceptor],
		}).compile();

		responseTransformInterceptor = moduleFixture.get(ResponseTransformInterceptor);
	});

	describe('Intercept', (): void => {
		const userMock: User = users[0];
		const userResponse: UserDto = plainToInstance(UserDto, userMock, {
			excludeExtraneousValues: true,
		});

		const next: CallHandler = {
			handle: jest.fn().mockReturnValue(of(userResponse)),
		};

		it('should wrap a response to a valid response format', async (): Promise<void> => {
			const result: SuccessfulResponseResult<object | null> = await firstValueFrom(
				responseTransformInterceptor.intercept({} as ExecutionContext, next),
			);

			expect(result.status).toBe(ResponseStatus.SUCCESS);
			expect(result.data).toEqual(userResponse);
		});

		it('should set null as a data if response result is null', async (): Promise<void> => {
			const result: SuccessfulResponseResult<object | null> = await firstValueFrom(
				responseTransformInterceptor.intercept({} as ExecutionContext, {
					handle: jest.fn().mockReturnValue(of(null)),
				}),
			);

			expect(result.data).toBeNull();
		});

		it('should set null as a data if response result is undefined', async (): Promise<void> => {
			const result: SuccessfulResponseResult<object | null> = await firstValueFrom(
				responseTransformInterceptor.intercept({} as ExecutionContext, {
					handle: jest.fn().mockReturnValue(of(undefined)),
				}),
			);

			expect(result.data).toBeNull();
		});
	});
});
