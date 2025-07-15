// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react'
import LatestNews from '../src/components/Home/LatestNews';
import { useDataStore } from '../src/store/dataStore';

test('LatestNews renders loading message when no news items', () => {
  useDataStore.setState({ newsItems: [] as any });
  render(<LatestNews />);
  expect(screen.getByText('Cargando noticias…')).toBeInTheDocument();
});
