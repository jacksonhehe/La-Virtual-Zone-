import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('players')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.CLUB)
  findAll() {
    return this.players.all();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body('name') name: string, @Body('clubId') clubId?: string) {
    return this.players.create({ name, clubId: clubId ? Number(clubId) : undefined });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('clubId') clubId?: string,
  ) {
    return this.players.update(Number(id), {
      name,
      clubId: clubId ? Number(clubId) : undefined,
    });
  }
}
