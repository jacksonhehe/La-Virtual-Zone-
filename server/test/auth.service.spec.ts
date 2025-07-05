import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('AuthService', () => {
  it('should be defined', async () => {
    process.env.SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test' })],
      providers: [AuthService, SupabaseService],
    }).compile();
    const service = module.get(AuthService);
    expect(service).toBeDefined();
  });
});
