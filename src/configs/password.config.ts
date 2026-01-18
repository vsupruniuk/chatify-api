export const passwordConfig = {
	saltHashRounds: Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
	validationRegExp: /^(?=.*\d)(?=.*[A-Z])/,
} as const;
