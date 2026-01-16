import { Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

import { IEmailService } from '@services';

import { accountActivationTemplate, resetPasswordTemplate } from '@emailTemplates';

import { EmailPriority, EmailSubject, Environment } from '@enums';

import { emailConfig } from '@configs';

@Injectable()
export class EmailService implements IEmailService {
	private _transporter: Transporter;

	constructor() {
		this._transporter = nodemailer.createTransport({
			host: emailConfig.host,
			port: emailConfig.port,
			secure: true,
			auth: {
				user: emailConfig.appEmail,
				pass: emailConfig.pass,
			},
		});

		this._transporter.verify((error: Error | null): void => {
			if (error) {
				console.log(error);
			}
		});
	}

	public async sendActivationEmail(receiverEmail: string, otpCode: number): Promise<void> {
		const emailContent: string = accountActivationTemplate(otpCode);

		return this._sendMail(
			receiverEmail,
			EmailSubject.ACCOUNT_ACTIVATION,
			emailContent,
			emailContent,
			EmailPriority.HIGH,
		);
	}

	public async sendResetPasswordEmail(
		receiverEmail: string,
		userName: string,
		token: string,
	): Promise<void> {
		const link: string = `${emailConfig.clientUrl}/reset-password/${token}`;

		const emailContent: string = resetPasswordTemplate(userName, emailConfig.appEmail, link);

		return this._sendMail(
			receiverEmail,
			EmailSubject.PASSWORD_RESET,
			emailContent,
			emailContent,
			EmailPriority.HIGH,
		);
	}

	private async _sendMail(
		receiverEmail: string,
		emailSubject: EmailSubject,
		emailText: string,
		emailHtml: string,
		emailPriority: EmailPriority = EmailPriority.NORMAL,
	): Promise<void> {
		if (emailConfig.supportedEnvironments.includes(process.env.NODE_ENV as Environment)) {
			await this._transporter.sendMail({
				from: { name: emailConfig.appName, address: emailConfig.appEmail },
				sender: { name: emailConfig.appName, address: emailConfig.appEmail },
				to: receiverEmail,
				subject: emailSubject,
				text: emailText,
				html: emailHtml,
				priority: emailPriority,
			});
		}
	}
}
