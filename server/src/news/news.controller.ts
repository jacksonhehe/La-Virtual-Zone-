import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.CLUB, Role.USER)
  findAll() {
    return this.news.all();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body('title') title: string, @Body('content') content: string) {
    return this.news.create({ title, content });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.news.update(Number(id), { title, content });
  }
}
