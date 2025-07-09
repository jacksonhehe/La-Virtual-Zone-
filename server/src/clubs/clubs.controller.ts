import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('clubs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.CLUB)
  findAll() {
    return this.clubs.all();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body('name') name: string) {
    return this.clubs.create({ name });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.clubs.update(Number(id), { name });
  }
}
