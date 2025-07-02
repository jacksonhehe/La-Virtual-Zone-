import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
