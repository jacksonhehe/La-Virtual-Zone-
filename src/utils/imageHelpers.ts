export function withWidth(url: string, width: number) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&auto=format`;
}

export function srcSet(url: string): string {
  return [480, 768, 1024]
    .map((w) => `${withWidth(url, w)} ${w}w`)
    .join(', ');
}

export const defaultSizes =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
