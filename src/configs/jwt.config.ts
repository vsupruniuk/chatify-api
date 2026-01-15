export const jwtConfig = {
	accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
	accessTokenExpiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
	refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
	refreshTokenExpiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN),
} as const;
