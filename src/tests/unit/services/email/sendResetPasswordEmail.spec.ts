import { Test, TestingModule } from '@nestjs/testing';

import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

import { EmailService } from '@services';

import * as templates from '@emailTemplates/resetPasswordTemplate';

import { EmailPriority, EmailSubject, Environment } from '@enums';

describe('Email service', (): void => {
	let emailService: EmailService;

	const appNameMock: string = String(process.env.APP_NAME);
	const smtpUserMock: string = String(process.env.SMTP_USER);
	const clientUrlMock: string = String(process.env.CLIENT_URL);
	const environmentMock: Environment = Environment.PROD;

	const transporterMock: Transporter = {
		verify: jest.fn(),
		sendMail: jest.fn(),
	} as unknown as Transporter;

	beforeAll(async (): Promise<void> => {
		process.env.NODE_ENV = environmentMock;

		jest.spyOn(nodemailer, 'createTransport').mockReturnValue(transporterMock);

		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [EmailService],
		}).compile();

		emailService = moduleFixture.get(EmailService);
	});

	afterAll((): void => {
		delete process.env.NODE_ENV;

		jest.restoreAllMocks();
	});

	describe('Send reset password email', (): void => {
		const receiverEmail: string = 'b.banner@avengers.com';
		const userName: string = 'b.banner';
		const token: string = 'qwerty12345';

		const resetPasswordTemplateMock: string = '<h1>Reset password email</h1>';

		beforeEach((): void => {
			jest.spyOn(templates, 'resetPasswordTemplate').mockReturnValue(resetPasswordTemplateMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		it('should call reset password template method to get an email template', async (): Promise<void> => {
			await emailService.sendResetPasswordEmail(receiverEmail, userName, token);

			expect(templates.resetPasswordTemplate).toHaveBeenCalledTimes(1);
			expect(templates.resetPasswordTemplate).toHaveBeenNthCalledWith(
				1,
				userName,
				smtpUserMock,
				`${clientUrlMock}/reset-password/${token}`,
			);
		});

		it('should call send mail method from nodemailer transporter', async (): Promise<void> => {
			await emailService.sendResetPasswordEmail(receiverEmail, userName, token);

			const expectedMailOptions: Mail.Options = {
				from: { name: appNameMock, address: smtpUserMock },
				sender: { name: appNameMock, address: smtpUserMock },
				to: receiverEmail,
				subject: EmailSubject.PASSWORD_RESET,
				text: resetPasswordTemplateMock,
				html: resetPasswordTemplateMock,
				priority: EmailPriority.HIGH,
			};

			expect(transporterMock.sendMail).toHaveBeenCalledTimes(1);
			expect(transporterMock.sendMail).toHaveBeenNthCalledWith(1, expectedMailOptions);
		});

		it('should not call send mail method from nodemailer transporter if current environment is not in list of supported', async (): Promise<void> => {
			process.env.NODE_ENV = Environment.DEV;

			await emailService.sendResetPasswordEmail(receiverEmail, userName, token);

			expect(transporterMock.sendMail).not.toHaveBeenCalled();
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await emailService.sendResetPasswordEmail(
				receiverEmail,
				userName,
				token,
			);

			expect(result).toBeUndefined();
		});
	});
});
