// @vitest-environment jsdom
import { render } from '@testing-library/react';
import LatestNews from '../src/components/Home/LatestNews';
import { useDataStore } from '../src/store/dataStore';

test('LatestNews renders without news items', () => {
  useDataStore.setState({ newsItems: [] as any });
  expect(() => render(<LatestNews />)).not.toThrow();
});
