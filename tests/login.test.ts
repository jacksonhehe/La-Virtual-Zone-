import { describe, it, expect, beforeEach, vi } from 'vitest';

const signInMock = vi.fn();
const singleMock = vi.fn();

vi.mock('../src/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: signInMock,
      getSession: vi.fn(() => ({ data: { session: null } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: singleMock })) }))
    }))
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('login', () => {
  it('returns user with clubId when record exists', async () => {
    signInMock.mockResolvedValueOnce({
      data: { user: { id: '1', email: 'a@b.com', user_metadata: { username: 'a', role: 'user' } } },
      error: null
    });
    singleMock.mockResolvedValueOnce({ data: { id: '1', username: 'a', email: 'a@b.com', role: 'user', clubId: 'club1', status: 'active' }, error: null });

    const { login } = await import('../src/utils/authService');
    const user = await login('a@b.com', 'pass');

    expect(user.clubId).toBe('club1');
    expect(user.id).toBe('1');
  });
});
