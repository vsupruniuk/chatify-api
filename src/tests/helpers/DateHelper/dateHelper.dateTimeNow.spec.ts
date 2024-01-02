import { DateHelper } from '@Helpers/date.helper';

describe('dateHelper', (): void => {
	describe('dateTimeNow', (): void => {
		const dateTimeMock: string = '2023-11-19 12:00:00';
		const dateTimePattern: RegExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(DateHelper.dateTimeNow).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(DateHelper.dateTimeNow).toBeInstanceOf(Function);
		});

		it('should return current date and time', (): void => {
			jest.setSystemTime(new Date(dateTimeMock));

			const dateTime: string = DateHelper.dateTimeNow();

			expect(dateTime).toEqual(dateTimeMock);
		});

		it('should return current date and time in format "YYYY-MM-dd hh:mm:ss"', (): void => {
			jest.setSystemTime(new Date(dateTimeMock));

			const dateTime: string = DateHelper.dateTimeNow();

			expect(dateTime).toMatch(dateTimePattern);
		});
	});
});
