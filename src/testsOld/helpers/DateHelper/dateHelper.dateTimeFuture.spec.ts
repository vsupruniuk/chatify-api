import { DateHelper } from '@helpers/date.helper';
import * as dayjs from 'dayjs';

describe.skip('dateHelper', (): void => {
	describe('dateTimeFuture', (): void => {
		const dateTimeMock: string = '2023-11-21 12:00:00';
		const dateTimePattern: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

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
			jest.setSystemTime(dayjs(dateTimeMock).toDate());

			const dateTime: string = DateHelper.dateTimeFuture(0);

			expect(dateTime).toEqual(dayjs(dateTimeMock).toISOString());
		});

		it('should return correct date and time in 10 minutes', () => {
			jest.setSystemTime(dayjs(dateTimeMock).toDate());

			const dateTimeFuture: string = '2023-11-21 12:10:00';
			const dateTime: string = DateHelper.dateTimeFuture(1000 * 60 * 10);

			expect(dateTime).toEqual(dayjs(dateTimeFuture).toISOString());
		});

		it('should return date and time in ISO string format', (): void => {
			jest.setSystemTime(dayjs(dateTimeMock).toDate());

			const dateTime: string = DateHelper.dateTimeFuture(100000);

			expect(dateTime).toMatch(dateTimePattern);
		});
	});
});
