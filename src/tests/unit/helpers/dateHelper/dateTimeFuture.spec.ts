import { DateHelper } from '@helpers/date.helper';

describe('Date helper', (): void => {
	describe('Date time future', (): void => {
		const dateMock: Date = new Date('2025-07-14 23:30:00');

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should be defined', (): void => {
			expect(DateHelper.dateTimeFuture).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(DateHelper.dateTimeFuture).toBeInstanceOf(Function);
		});

		it('should return future date and time after provided time', (): void => {
			jest.setSystemTime(dateMock);

			expect(DateHelper.dateTimeFuture(1000 * 60 * 15)).toBe(
				new Date('2025-07-14 23:45:00').toISOString(),
			);
		});

		it('should return current date and time if milliseconds is 0', (): void => {
			jest.setSystemTime(dateMock);

			expect(DateHelper.dateTimeFuture(0)).toBe(dateMock.toISOString());
		});
	});
});
