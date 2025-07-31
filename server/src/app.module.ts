import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';
import { MarketModule } from './market/market.module';
import { SanitizationService } from './common/services/sanitization.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, 
    AuthModule, 
    ClubsModule, 
    PlayersModule, 
    MarketModule
  ],
  controllers: [HealthController],
  providers: [SanitizationService],
  exports: [SanitizationService],
})
export class AppModule {}
