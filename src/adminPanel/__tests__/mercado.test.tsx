import  { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react'
import { useGlobalStore, subscribe } from '../store/globalStore';
import Mercado from '../pages/admin/Mercado';

vi.mock('../store/globalStore');

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

vi.mocked(subscribe as any).mockReturnValue(() => {})

describe.skip('Mercado Component', () => {
  beforeEach(() => {
    vi.mocked(useGlobalStore).mockReturnValue(mockStore);
  });

  it('should render pending transfers', () => {
    render(<Mercado />);
    expect(screen.getByText('Transferencia #1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // pending count badge
  });

  it('should approve transfer', () => {
    render(<Mercado />);
    const approveButton = screen.getByTitle('Aprobar');
    
    fireEvent.click(approveButton);
    
    expect(mockStore.approveTransfer).toHaveBeenCalledWith('1');
  });
});
 