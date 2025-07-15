// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { supabase } from '../src/lib/supabaseClient';
vi.spyOn(supabase, 'from').mockReturnValue({ select: () => ({ data: [], error: null }) } as any)
import LatestNews from '../src/components/Home/LatestNews';
import { useDataStore } from '../src/store/dataStore';

test('LatestNews renders loading message when no news items', () => {
  useDataStore.setState({ newsItems: [] as any });
  vi.spyOn(supabase, 'from').mockReturnValue({ select: () => ({ data: [], error: null }) } as any)
  render(<LatestNews />);
  expect(screen.getByText('Cargando noticias…')).toBeInTheDocument();
});
