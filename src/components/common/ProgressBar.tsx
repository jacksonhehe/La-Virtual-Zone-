import { useEffect, useRef, useState } from 'react';

interface ProgressBarProps {
  value: number | null;
}

const ProgressBar = ({ value }: ProgressBarProps) => {
  const [animate, setAnimate] = useState(false);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current !== null && value !== prev.current) {
      setAnimate(true);
      const id = setTimeout(() => setAnimate(false), 1000);
      prev.current = value;
      return () => clearTimeout(id);
    }
    prev.current = value;
  }, [value]);

  if (value === null) {
    return (
      <div className="w-full rounded bg-zinc-800 py-1 text-center text-xs text-gray-400">
        Sin datos
      </div>
    );
  }

  const color = value >= 50 ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-full rounded bg-zinc-800">
        <div
          className={`h-full rounded ${color} transition-[width] duration-500 ease-out ${animate ? 'animate-pulse' : ''}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs">{value}%</span>
    </div>
  );
};

export default ProgressBar;
