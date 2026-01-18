import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

/**
 * Helper class for dates
 */
export class DateHelper {
	/**
	 * Generate and return current date and time
	 * @returns dateTime - current date and time in ISO string format
	 */
	public static dateTimeNow(): string {
		return this._formatDate(dayjs());
	}

	/**
	 * Generate and return date and time in future
	 * @param milliseconds - milliseconds to add
	 * @returns dateTime - future date and time in ISO string format
	 */
	public static dateTimeFuture(milliseconds: number): string {
		const dateNow: Dayjs = dayjs();

		const millisecondsFixed: number = Math.max(milliseconds, 0);

		return this._formatDate(dateNow.add(millisecondsFixed, 'milliseconds'));
	}

	/**
	 * Check if target date less then current
	 * @param date - date to checking
	 * @returns true - if target date less then current
	 * @returns false - if target date greater then current
	 */
	public static isDateLessThanCurrent(date: string): boolean {
		const currentDate: Dayjs = dayjs();
		const targetDate: Dayjs = dayjs(date);

		return targetDate.isBefore(currentDate);
	}

	/**
	 * Generate and return current timestamp
	 * @returns - current timestamp
	 */
	public static timestampNow(): number {
		return dayjs().unix();
	}

	private static _formatDate(date: Dayjs): string {
		return date.toISOString();
	}
}
