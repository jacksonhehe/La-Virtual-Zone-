import  { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useGlobalStore, subscribe as subscribeGlobal } from '../store/globalStore';
import Mercado from '../pages/admin/Mercado';

vi.mock('../store/globalStore');

// A helper noop function to simulate unsubscribe
const noop = () => {};

const mockStore = {
  transfers: [
    {
      id: '1',
      playerId: 'player1',
      fromClubId: 'club1',
      toClubId: 'club2',
      amount: 100000,
      status: 'pending' as const,
      createdAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  approveTransfer: vi.fn(),
  rejectTransfer: vi.fn()
};

describe('Mercado Component', () => {
  beforeEach(() => {
    vi.mocked(useGlobalStore).mockReturnValue(mockStore as any);
    // Ensure the subscribe mock returns a noop unsubscribe function
    vi.mocked(subscribeGlobal as any).mockReturnValue(noop);
  });

  it('should render pending transfers', () => {
    render(<Mercado />);
    expect(screen.getByText('Transferencia #1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // pending count badge
  });

  it('should approve transfer', () => {
    render(<Mercado />);
    const approveButton = screen.getByTitle('Aprobar transferencia');
    
    fireEvent.click(approveButton);
    
    expect(mockStore.approveTransfer).toHaveBeenCalledWith('1');
  });
});
 