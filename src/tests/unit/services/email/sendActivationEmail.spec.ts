import { Test, TestingModule } from '@nestjs/testing';

import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

import { EmailService } from '@services';

import * as templates from '@emailTemplates/accountActivationTemplate';

import { EmailPriority, EmailSubject, Environment } from '@enums';

describe('Email service', (): void => {
	let emailService: EmailService;

	const appNameMock: string = String(process.env.APP_NAME);
	const smtpUserMock: string = String(process.env.SMTP_USER);
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

	describe('Send activation email', (): void => {
		const receiverEmail: string = 'b.banner@averngers.com';
		const otpCode: number = 123456;

		const accountActivationTemplateMock: string = '<h1>Hello, world!</h1>';

		beforeEach((): void => {
			jest
				.spyOn(templates, 'accountActivationTemplate')
				.mockReturnValue(accountActivationTemplateMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should use email template from account activation template method', async (): Promise<void> => {
			await emailService.sendActivationEmail(receiverEmail, otpCode);

			expect(templates.accountActivationTemplate).toHaveBeenCalledTimes(1);
			expect(templates.accountActivationTemplate).toHaveBeenNthCalledWith(1, otpCode);
		});

		it('should call send mail method from nodemailer transporter', async (): Promise<void> => {
			await emailService.sendActivationEmail(receiverEmail, otpCode);

			const expectedMailOptions: Mail.Options = {
				from: { name: appNameMock, address: smtpUserMock },
				sender: { name: appNameMock, address: smtpUserMock },
				to: receiverEmail,
				subject: EmailSubject.ACCOUNT_ACTIVATION,
				text: accountActivationTemplateMock,
				html: accountActivationTemplateMock,
				priority: EmailPriority.HIGH,
			};

			expect(transporterMock.sendMail).toHaveBeenCalledTimes(1);
			expect(transporterMock.sendMail).toHaveBeenNthCalledWith(1, expectedMailOptions);
		});

		it('should not call send mail method from nodemailer transporter if current environment is not in list of supported', async (): Promise<void> => {
			process.env.NODE_ENV = Environment.DEV;

			await emailService.sendActivationEmail(receiverEmail, otpCode);

			expect(transporterMock.sendMail).not.toHaveBeenCalled();
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await emailService.sendActivationEmail(receiverEmail, otpCode);

			expect(result).toBeUndefined();
		});
	});
});
