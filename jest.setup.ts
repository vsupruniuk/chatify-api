jest.mock('nodemailer', () => {
	return {
		createTransport: () => ({
			verify: (callback: CallableFunction) => callback(null, true),
			sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked' }),
		}),
	};
});
