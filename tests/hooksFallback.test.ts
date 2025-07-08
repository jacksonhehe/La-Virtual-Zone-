import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { clubs, tournaments } from '../src/data/mockData.ts';

const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));
const channelMock = vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() }));

vi.mock('../src/supabaseClient', () => ({
  supabase: {
    from: fromMock,
    channel: channelMock,
    removeChannel: vi.fn(),
    auth: { getSession: vi.fn(() => ({ data: { session: null } })) }
  }
}));

beforeEach(() => {
  vi.resetModules();
  orderMock.mockReset();
  selectMock.mockReturnValue({ order: orderMock });
  fromMock.mockReturnValue({ select: selectMock });
});

describe('hooks fallback data', () => {
  it('useClubes returns mock clubs when supabase fails', async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: new Error('fail') });

    const { default: useClubes } = await import('../src/hooks/useClubes');
    const { result } = renderHook(() => useClubes());

    await act(async () => {
      await new Promise(setImmediate);
    });
    expect(result.current.clubes).toEqual(clubs);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('useTorneos returns mock tournaments when supabase fails', async () => {
    orderMock.mockResolvedValueOnce({ data: null, error: new Error('fail') });

    const { default: useTorneos } = await import('../src/hooks/useTorneos');
    const { result } = renderHook(() => useTorneos());

    await act(async () => {
      await new Promise(setImmediate);
    });
    expect(result.current.torneos.length).toBe(tournaments.length);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('useTorneos returns mock tournaments when supabase returns empty array', async () => {
    orderMock.mockResolvedValueOnce({ data: [], error: null });

    const { default: useTorneos } = await import('../src/hooks/useTorneos');
    const { result } = renderHook(() => useTorneos());

    await act(async () => {
      await new Promise(setImmediate);
    });
    expect(result.current.torneos.length).toBe(tournaments.length);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
