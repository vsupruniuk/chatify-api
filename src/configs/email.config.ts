import { Environment } from '@enums';

export const emailConfig = {
	host: process.env.SMTP_HOST,
	pass: process.env.SMTP_PASS,
	port: Number(process.env.SMTP_PORT),
	clientUrl: String(process.env.CLIENT_URL),
	appName: String(process.env.APP_NAME),
	appEmail: String(process.env.SMTP_USER),
	supportedEnvironments: [Environment.PROD] as Environment[],
} as const;
