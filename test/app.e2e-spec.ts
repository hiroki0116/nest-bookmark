import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(8888);
    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    // pactum base url
    pactum.request.setBaseUrl('http://localhost:8888');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: AuthDto = {
        email: 'test@test.com',
        password: 'password1234',
      };
      it('should create a user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });

      it('should throw a ForbiddenException when the email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            email: 'test',
          })
          .expectStatus(400);
      });

      it('should throw a ForbiddenException when the password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            password: '',
          });
      });
    });

    describe('Login', () => {
      const dto: AuthDto = {
        email: 'test@test.com',
        password: 'password1234',
      };
      it('should return a token when the credentials are correct', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .expectJsonLike({
            access_token: /.*/,
          })
          .stores('token', 'access_token');
      });
      it('should throw a ForbiddenException when the email is invalid', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            ...dto,
            email: 'test',
          })
          .expectStatus(400);
      });
      it('should throw a ForbiddenException when the password is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            ...dto,
            password: '',
          })
          .expectStatus(400);
      });
      it("should throw a ForbiddenException when the user doesn't exist", () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'wrong@test.com',
            password: 'password1234',
          })
          .expectStatus(403);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should return the user data', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200);
      });
      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });
    describe('Edit user', () => {
      const dto = {
        email: 'updated@gmail.com',
        firstName: 'mr.testman',
      };

      it('should return the updated user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum.spec().patch('/users').withBody(dto).expectStatus(401);
      });
      it('should throw a ForbiddenException when the email is invalid', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody({ ...dto, email: 'test' })
          .expectStatus(401);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => {
      it.todo(
        'should return the created bookmark when the user is authenticated',
      );
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
    });
    describe('Get all bookmarks', () => {
      it.todo('should return all the bookmarks when the user is authenticated');
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
    });
    describe('Get bookmark by id', () => {
      it.todo('should return the bookmark when the user is authenticated');
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
    });
    describe('Edit bookmark', () => {
      it.todo(
        'should return the updated bookmark when the user is authenticated',
      );
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
    });
    describe('Delete bookmark', () => {
      it.todo(
        'should return the deleted bookmark when the user is authenticated',
      );
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
    });
  });
});
