import { DateHelper } from '@helpers';

import { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';

describe('Date helper', (): void => {
	describe('Date time now', (): void => {
		const dateMock: Dayjs = dayjs('2025-07-14 19:00:00');

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should return current date and time in ISO string format', (): void => {
			jest.setSystemTime(dateMock.toDate());

			expect(DateHelper.dateTimeNow()).toBe(dateMock.toISOString());
		});
	});
});
