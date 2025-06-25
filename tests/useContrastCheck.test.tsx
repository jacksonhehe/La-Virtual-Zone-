import { renderHook } from '@testing-library/react';
import useContrastCheck from '../src/hooks/useContrastCheck';

test('returns true for high contrast colors', () => {
  const { result } = renderHook(() => useContrastCheck('#ffffff', '#000000'));
  expect(result.current).toBe(true);
});

test('returns false for low contrast colors', () => {
  const { result } = renderHook(() => useContrastCheck('#777777', '#888888'));
  expect(result.current).toBe(false);
});
