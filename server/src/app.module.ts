import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';
import { MarketModule } from './market/market.module';

@Module({
  imports: [PrismaModule, AuthModule, ClubsModule, PlayersModule, MarketModule],
  controllers: [HealthController],
})
export class AppModule {}
