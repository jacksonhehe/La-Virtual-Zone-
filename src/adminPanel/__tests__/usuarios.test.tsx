import  { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react'
import { useGlobalStore } from '../store/globalStore';
import Usuarios from '../pages/admin/Usuarios';

vi.mock('../store/globalStore');

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


describe.skip('Usuarios Component', () => {
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
    const searchInput = screen.getByPlaceholderText('Buscar usuarios...');
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should open new user modal', () => {
    render(<Usuarios />);
    const newUserButton = screen.getByText('Nuevo Usuario');
    
    fireEvent.click(newUserButton);
    
    expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
  });
});
 