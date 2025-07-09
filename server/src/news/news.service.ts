import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  all() {
    return this.prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: { title: string; content: string }) {
    return this.prisma.news.create({ data });
  }

  update(id: number, data: { title?: string; content?: string }) {
    return this.prisma.news.update({ where: { id }, data });
  }
}
