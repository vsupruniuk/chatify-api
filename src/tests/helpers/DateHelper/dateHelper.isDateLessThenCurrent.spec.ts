import { DateHelper } from '@Helpers/date.helper';
import * as dayjs from 'dayjs';

describe('dateHelper', (): void => {
	describe('isDateLessThenCurrent', (): void => {
		const dateTimeMock: string = '2023-11-24 23:10:00';

		beforeEach((): void => {
			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.useRealTimers();
		});

		it('should be declared', (): void => {
			expect(DateHelper.isDateLessThanCurrent).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(DateHelper.isDateLessThanCurrent).toBeInstanceOf(Function);
		});

		it('should return true if target date less then current', (): void => {
			jest.setSystemTime(dayjs(dateTimeMock).toDate());

			const dateTime: string = '2023-11-24 23:00:00';

			const result: boolean = DateHelper.isDateLessThanCurrent(dateTime);

			expect(result).toEqual(true);
		});

		it('should return false if target date greater then current', (): void => {
			jest.setSystemTime(dayjs(dateTimeMock).toDate());

			const dateTime: string = '2023-11-24 23:20:00';

			const result: boolean = DateHelper.isDateLessThanCurrent(dateTime);

			expect(result).toEqual(false);
		});

		it('should return false if target date equal to current', (): void => {
			jest.setSystemTime(dayjs(dateTimeMock).toDate());

			const dateTime: string = '2023-11-24 23:10:00';

			const result: boolean = DateHelper.isDateLessThanCurrent(dateTime);

			expect(result).toEqual(false);
		});
	});
});
