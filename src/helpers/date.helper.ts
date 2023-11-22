/**
 * Helper class for dates
 */
export class DateHelper {
	/**
	 * Generate and return current date and time
	 * @returns dateTime - current date and time in format "YYYY-MM-dd hh:mm:ss"
	 */
	public static dateTimeNow(): string {
		const dateNow: Date = new Date();

		return this.formatDate(dateNow);
	}

	public static dateTimeFuture(milliseconds: number): string {
		const dateNow: number = Date.now();

		return this.formatDate(new Date(dateNow + milliseconds));
	}

	private static formatDate(date: Date) {
		const year: number = date.getFullYear();
		const month: string = String(date.getMonth() + 1).padStart(2, '0');
		const day: string = String(date.getDate()).padStart(2, '0');

		const hours: string = String(date.getHours()).padStart(2, '0');
		const minutes: string = String(date.getMinutes()).padStart(2, '0');
		const seconds: string = String(date.getSeconds()).padStart(2, '0');

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
}
