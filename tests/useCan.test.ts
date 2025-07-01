import { describe, it, expect, beforeEach } from 'vitest';
import useCan from '../src/hooks/useCan';
import { useAuthStore } from '../src/store/authStore';

const baseUser = {
  id: '1',
  username: 'test',
  email: 'test@example.com',
  status: 'active' as const
};

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('useCan', () => {
  it('returns true when user role is permitted', () => {
    useAuthStore.setState({ user: { ...baseUser, role: 'admin' as const }, isAuthenticated: true });
    const allowed = useCan(['admin', 'dt']);
    expect(allowed).toBe(true);
  });

  it('returns false when user role is not permitted', () => {
    useAuthStore.setState({ user: { ...baseUser, role: 'user' as const }, isAuthenticated: true });
    const allowed = useCan(['admin', 'dt']);
    expect(allowed).toBe(false);
  });

  it('returns false when no user is logged in', () => {
    const allowed = useCan(['admin']);
    expect(allowed).toBe(false);
  });
});
