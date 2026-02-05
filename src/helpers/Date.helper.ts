import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

/**
 * Class with static helper methods for actions with dates
 */
export class DateHelper {
	/**
	 * Retrieve and return current date and time in ISO format
	 * @returns string - ISO formated date string
	 */
	public static dateTimeNow(): string {
		return this._formatDate(dayjs());
	}

	/**
	 * Retrieve current date and return the date in the future after milliseconds from the parameter
	 * @param milliseconds - number of milliseconds to add to the current date
	 * @returns string - ISO formated date string
	 */
	public static dateTimeFuture(milliseconds: number): string {
		const dateNow: Dayjs = dayjs();

		const millisecondsFixed: number = Math.max(milliseconds, 0);

		return this._formatDate(dateNow.add(millisecondsFixed, 'milliseconds'));
	}

	/**
	 * Compare provided date with current and return a boolean value
	 * representing is date less than current or not
	 * @param date - string date what need to compare to current
	 * @returns boolean - boolean value representing is date less than current or not
	 */
	public static isDateLessThanCurrent(date: string): boolean {
		const currentDate: Dayjs = dayjs();
		const targetDate: Dayjs = dayjs(date);

		return targetDate.isBefore(currentDate);
	}

	/**
	 * Retrieve and return current date and time in unix timestamp
	 * @returns number - unix timestamp current date
	 */
	public static timestampNow(): number {
		return dayjs().unix();
	}

	/**
	 * Formats dayjs date to ISO string
	 * @param date - dayjs date object to format
	 * @returns string - ISO formated date string
	 */
	private static _formatDate(date: Dayjs): string {
		return date.toISOString();
	}
}
