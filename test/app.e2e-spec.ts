import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

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
      const dto: CreateBookmarkDto = {
        link: 'https://www.google.com',
        title: 'Google',
        description: 'Search engine',
      };
      it('should return the created bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(dto)
          .expectBodyContains(dto.link)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .stores('bookmarkId', 'id');
      });
      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum.spec().post('/bookmarks').withBody(dto).expectStatus(401);
      });
    });
    describe('Get all bookmarks', () => {
      it('should return all the bookmarks when the user is authenticated', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });

      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });
    describe('Get bookmark by id', () => {
      it('should return the bookmark with id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      });
      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum.spec().get(`/bookmarks/$S{bookmarkId}`).expectStatus(401);
      });
    });
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        link: 'https://www.updated.com',
        title: 'Updated',
        description: 'Updated',
      };
      it('should return the updated bookmark when the user is authenticated', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.link)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum
          .spec()
          .patch(`/bookmarks/$S{bookmarkId}`)
          .withBody(dto)
          .expectStatus(401);
      });
    });
    describe('Delete bookmark', () => {
      it('should delete the bookmark when the user is authenticated', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(204);
      });
      it('should return an empty array when the user is authenticated', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });

      it('should throw a ForbiddenException when the user is not authenticated', () => {
        return pactum
          .spec()
          .delete(`/bookmarks/$S{bookmarkId}`)
          .expectStatus(401);
      });
    });
  });
});
