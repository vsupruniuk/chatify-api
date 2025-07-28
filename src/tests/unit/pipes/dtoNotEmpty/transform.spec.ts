import { DtoNotEmptyPipe } from '@pipes/dtoNotEmpty.pipe';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

describe('Dto not empty pipe', (): void => {
	let dtoNotEmptyPipe: DtoNotEmptyPipe;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [DtoNotEmptyPipe],
		}).compile();

		dtoNotEmptyPipe = moduleFixture.get(DtoNotEmptyPipe);
	});

	describe('Transform', (): void => {
		it('should be defined', (): void => {
			expect(dtoNotEmptyPipe.transform).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(dtoNotEmptyPipe.transform).toBeInstanceOf(Function);
		});

		it('should throw bar request exception if passed object does not contains any keys', (): void => {
			expect(() => dtoNotEmptyPipe.transform({})).toThrow(BadRequestException);
		});

		it('should return the same value if object has at least one key', (): void => {
			const data: object = { user: 't.odinson' };

			const result: object = dtoNotEmptyPipe.transform(data);

			expect(result).toEqual(data);
		});
	});
});
