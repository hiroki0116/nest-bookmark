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
      it('should create a user', () => {
        const dto: AuthDto = {
          email: 'test@test.com',
          password: 'password1234',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Login', () => {
      it.todo(
        'should return a token and the user data when the credentials are correct',
      );
      it.todo(
        'should throw a ForbiddenException when the credentials are incorrect',
      );
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it.todo('should return the user data when the user is authenticated');
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
    });
    describe('Edit user', () => {
      it.todo(
        'should return the updated user data when the user is authenticated',
      );
      it.todo(
        'should throw a ForbiddenException when the user is not authenticated',
      );
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
