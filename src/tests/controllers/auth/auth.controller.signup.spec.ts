import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '@Modules/auth.module';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import * as request from 'supertest';
import { AppModule } from '@Modules/app.module';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { plainToClass } from 'class-transformer';
import { UserShortDto } from '@DTO/users/UserShort.dto';

// TODO get user by email and nickname mocks

describe('AuthController', (): void => {
	let app: INestApplication;
	const users: UserShortDto[] = [];

	const mockUsersService = {
		async getByEmail(userEmail: string): Promise<UserShortDto | null> {
			return users.find((user: UserShortDto) => user.email === userEmail) || null;
		},

		async getByNickname(userNickname: string): Promise<UserShortDto | null> {
			return users.find((user: UserShortDto) => user.nickname === userNickname) || null;
		},

		async createUser(signupUserDto: SignupUserDto): Promise<UserShortDto> {
			const user = plainToClass(UserShortDto, <UserShortDto>{
				...signupUserDto,
				id: '4',
				about: null,
				avatarUrl: null,
				accountSettingsId: '01',
				OTPCodeId: '001',
			});

			users.push(user);

			return user;
		},
	};

	const mockEmailService = {};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(mockUsersService)
			.overrideProvider(CustomProviders.I_EMAIL_SERVICE)
			.useValue(mockEmailService)
			.compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/signup', (): void => {
		it('should return 400 status if email is missing', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email is incorrect', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce.mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 status if email is already taken', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.send(user)
				.expect(HttpStatus.CONFLICT);
		});

		it('should return 400 status if firstName is not a string', (): Test => {
			const user = {
				firstName: 2,
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if firstName is to short', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Br',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if lastName is present but to short', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Ba',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 409 status if nickname is already taken', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.send(user)
				.expect(HttpStatus.CONFLICT);
		});

		it('should return 400 status if nickname is to short', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'bb',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is not a string', (): Test => {
			const user = {
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 2,
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is to short', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwert',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password not contains at least 1 number', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwertyA',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password not contains at least 1 uppercase letter', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1',
				passwordConfirmation: 'qwerty1A',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation is not a string', (): Test => {
			const user = {
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 2,
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation is to short', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwert',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation not contains at least 1 number', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwertyA',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password confirmation not contains at least 1 uppercase letter', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password and password confirmation not matching', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1AA',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 201 status and user data', (): Test => {
			const user = <SignupUserDto>{
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				password: 'qwerty1A',
				passwordConfirmation: 'qwerty1A',
			};

			const signupResponse = <UserShortDto>{
				id: '4',
				firstName: 'Bruce',
				lastName: 'Banner',
				email: 'bruce@mail.com',
				nickname: 'b.banner',
				about: null,
				avatarUrl: null,
				accountSettingsId: '01',
				OTPCodeId: '001',
			};

			return request(app.getHttpServer())
				.post('/auth/signup')
				.send(user)
				.expect(HttpStatus.CREATED)
				.expect(signupResponse);
		});
	});
});
