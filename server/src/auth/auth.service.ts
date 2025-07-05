import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async validateUser(email: string, pass: string) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({ email, password: pass });
    if (error || !data.session) throw new UnauthorizedException();
    const { user } = data.session;
    return { id: user.id, role: (user.user_metadata as any)?.role || 'user' };
  }

  async login(res: any, email: string, password: string) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new UnauthorizedException(error?.message);
    res.cookie('refreshToken', data.session.refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
    });
    return { accessToken: data.session.access_token };
  }

  async refresh(res: any, token: string) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.setSession({ refresh_token: token, access_token: '' });
    if (error || !data.session) throw new UnauthorizedException(error?.message);
    res.cookie('refreshToken', data.session.refresh_token, {
      httpOnly: true,
      path: '/auth/refresh',
    });
    return { accessToken: data.session.access_token };
  }
}
