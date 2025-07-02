import { Controller, Get, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('market')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Get('transfers')
  @Roles(Role.ADMIN, Role.CLUB)
  allTransfers() {
    return this.market.transfers();
  }
}
