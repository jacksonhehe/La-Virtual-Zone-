export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export const isTomorrow = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
};

export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return NaN;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
};
