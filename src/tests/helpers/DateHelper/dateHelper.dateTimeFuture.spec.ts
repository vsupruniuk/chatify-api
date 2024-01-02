import { DateHelper } from '@Helpers/date.helper';

describe('dateHelper', (): void => {
	describe('dateTimeFuture', (): void => {
		const dateTimeMock: string = '2023-11-21 12:00:00';
		const dateTimePattern: RegExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(DateHelper.dateTimeFuture).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(DateHelper.dateTimeFuture).toBeInstanceOf(Function);
		});

		it('should return current date and time if passed 0 milliseconds', (): void => {
			jest.setSystemTime(new Date(dateTimeMock));

			const dateTime: string = DateHelper.dateTimeFuture(0);

			expect(dateTime).toEqual(dateTimeMock);
		});

		it('should return correct date and time in 10 minutes', () => {
			jest.setSystemTime(new Date(dateTimeMock));

			const dateTimeFuture: string = '2023-11-21 12:10:00';
			const dateTime: string = DateHelper.dateTimeFuture(1000 * 60 * 10);

			expect(dateTime).toEqual(dateTimeFuture);
		});

		it('should return date and time in format "YYYY-MM-dd hh:mm:ss"', (): void => {
			jest.setSystemTime(new Date(dateTimeMock));

			const dateTime: string = DateHelper.dateTimeFuture(100000);

			expect(dateTime).toMatch(dateTimePattern);
		});
	});
});
