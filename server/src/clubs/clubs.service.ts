import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ClubsService {
  constructor(private readonly supabase: SupabaseService) {}

  all() {
    return this.supabase.getClient().from('clubes').select('*');
  }
}
