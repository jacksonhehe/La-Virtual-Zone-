import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MarketService {
  constructor(private readonly supabase: SupabaseService) {}

  transfers() {
    return this.supabase.getClient().from('transfers').select('*');
  }
}
