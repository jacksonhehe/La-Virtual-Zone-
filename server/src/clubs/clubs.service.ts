import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  all() {
    return this.prisma.club.findMany();
  }

  create(data: { name: string }) {
    return this.prisma.club.create({ data });
  }

  update(id: number, data: { name?: string }) {
    return this.prisma.club.update({ where: { id }, data });
  }
}
