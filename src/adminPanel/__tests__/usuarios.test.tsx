import  { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../store/globalStore');
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ data: [] })) })),
    auth: { getSession: vi.fn(() => ({ data: { session: null } })) }
  }
}));

import { useGlobalStore } from '../store/globalStore';
import Usuarios from '../pages/admin/Usuarios';

const mockStore = {
  users: [
    {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as const,
      status: 'active' as const,
      createdAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  addUser: vi.fn(),
  updateUser: vi.fn(),
  removeUser: vi.fn(),
  setLoading: vi.fn()
};

describe('Usuarios Component', () => {
  beforeEach(() => {
    vi.mocked(useGlobalStore).mockReturnValue(mockStore);
  });

  it('should render users list', () => {
    render(<Usuarios />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should filter users by search term', async () => {
    render(<Usuarios />);
    const searchInput = screen.getByPlaceholderText('Buscar por usuario o email...');

    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should open new user modal', () => {
    render(<Usuarios />);
    const newUserButton = screen.getByText('Nuevo Usuario');

    fireEvent.click(newUserButton);

    expect(screen.getAllByText('Nuevo Usuario').length).toBeGreaterThan(1);
  });
});
 