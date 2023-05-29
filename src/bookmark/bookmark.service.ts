import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId: userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmark(userId: number, id: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async editBookmark(userId: number, id: number, dto: EditBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }

    return this.prisma.bookmark.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmark(userId: number, id: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new NotFoundException('Bookmark not found');
    }

    return this.prisma.bookmark.delete({
      where: {
        id,
      },
    });
  }
}
