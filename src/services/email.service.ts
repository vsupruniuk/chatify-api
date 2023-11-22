import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { EmailPrioriy } from '@Enums/EmailPrioriy.enum';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { accountActivationTemplate } from '../emailTemplates/accountActivationTemplate';

@Injectable()
export class EmailService implements IEmailService {
	private readonly _appName: string = 'Chatify';
	private readonly _appEmail: string = process.env.SMTP_USER;
	private _transporter: Transporter;

	constructor() {
		this._transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: true,
			auth: {
				user: this._appEmail,
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

	public async sendActivationEmail(receiverEmail: string, OPTCode: number): Promise<void> {
		const emailSubject: string = 'Chatify Account Activation';
		const emailContent: string = accountActivationTemplate(OPTCode);

		return this.sendMail(
			receiverEmail,
			emailSubject,
			emailContent,
			emailContent,
			EmailPrioriy.HIGH,
		);
	}

	private async sendMail(
		receiverEmail: string,
		emailSubject: string,
		emailText: string,
		emailHtml: string,
		emailPriority: EmailPrioriy = EmailPrioriy.NORMAL,
	): Promise<void> {
		await this._transporter.sendMail({
			from: { name: this._appName, address: this._appEmail },
			sender: { name: this._appName, address: this._appEmail },
			to: receiverEmail,
			subject: emailSubject,
			text: emailText,
			html: emailHtml,
			priority: emailPriority,
		});
	}
}
