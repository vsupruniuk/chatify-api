import { Trim } from '@decorators/sanitizing';
import { plainToInstance } from 'class-transformer';

describe('Trim', (): void => {
	class TestDto {
		@Trim()
		firstName: string;

		@Trim()
		age: number;
	}

	it('should trim all whitespaces in string values', (): void => {
		const firstName: string = '   Tony   ';

		const transformedValue: TestDto = plainToInstance(TestDto, { firstName });

		expect(transformedValue.firstName).toBe('Tony');
	});

	it('should return empty string if value contains only whitespaces', (): void => {
		const firstName: string = '          ';

		const transformedValue: TestDto = plainToInstance(TestDto, { firstName });

		expect(transformedValue.firstName).toBe('');
	});

	it('should return unmodified value if it is not a string', (): void => {
		const age: number = 24;

		const transformedValue: TestDto = plainToInstance(TestDto, { age });

		expect(transformedValue.age).toBe(24);
	});
});
