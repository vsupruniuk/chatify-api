import { Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

import { IEmailService } from '@Interfaces/emails/IEmailService';
import { EmailPriority } from '@Enums/EmailPrioriy.enum';

import { accountActivationTemplate } from '@EmailTemplates/accountActivationTemplate';

@Injectable()
export class EmailService implements IEmailService {
	private readonly APP_NAME: string = 'Chatify';
	private readonly APP_EMAIL: string = process.env.SMTP_USER || '';
	private _transporter: Transporter;

	constructor() {
		this._transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: true,
			auth: {
				user: this.APP_EMAIL,
				pass: process.env.SMTP_PASS,
			},
		});

		this._transporter.verify((error: Error, success: true): void => {
			if (success) {
				console.log('Server is ready to take messages');
			} else {
				console.log(error);
			}
		});
	}

	public async sendActivationEmail(receiverEmail: string, otpCode: number): Promise<void> {
		const emailSubject: string = 'Chatify Account Activation';
		const emailContent: string = accountActivationTemplate(otpCode);

		return this.sendMail(
			receiverEmail,
			emailSubject,
			emailContent,
			emailContent,
			EmailPriority.HIGH,
		);
	}

	private async sendMail(
		receiverEmail: string,
		emailSubject: string,
		emailText: string,
		emailHtml: string,
		emailPriority: EmailPriority = EmailPriority.NORMAL,
	): Promise<void> {
		await this._transporter.sendMail({
			from: { name: this.APP_NAME, address: this.APP_EMAIL },
			sender: { name: this.APP_NAME, address: this.APP_EMAIL },
			to: receiverEmail,
			subject: emailSubject,
			text: emailText,
			html: emailHtml,
			priority: emailPriority,
		});
	}
}
