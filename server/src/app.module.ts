import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { HealthController } from './health.controller';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';
import { MarketModule } from './market/market.module';

@Module({
  imports: [SupabaseModule, AuthModule, ClubsModule, PlayersModule, MarketModule],
  controllers: [HealthController],
})
export class AppModule {}
