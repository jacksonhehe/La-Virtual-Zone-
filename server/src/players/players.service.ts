import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  all() {
    return this.prisma.player.findMany();
  }

  create(data: { name: string; clubId?: number }) {
    return this.prisma.player.create({ data });
  }

  update(id: number, data: { name?: string; clubId?: number }) {
    return this.prisma.player.update({ where: { id }, data });
  }
}
