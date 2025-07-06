import { describe, it, expect, beforeEach, vi } from 'vitest';

const getSessionMock = vi.fn();
const singleMock = vi.fn();

vi.mock('../src/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: singleMock })) }))
    }))
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCurrentUser', () => {
  it('returns user with clubId when record exists', async () => {
    getSessionMock.mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: '1',
            email: 'a@b.com',
            user_metadata: { username: 'a', role: 'user' }
          }
        }
      }
    });
    singleMock.mockResolvedValueOnce({
      data: {
        id: '1',
        username: 'a',
        email: 'a@b.com',
        role: 'user',
        clubId: 'club1',
        status: 'active'
      },
      error: null
    });

    const { getCurrentUser } = await import('../src/utils/authService');
    const user = await getCurrentUser();

    expect(user?.clubId).toBe('club1');
    expect(user?.id).toBe('1');
  });
});
