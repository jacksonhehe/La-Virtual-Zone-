import { useEffect, useRef, useState } from 'react';

interface CountdownBarProps {
  date: string;
}

const CountdownBar = ({ date }: CountdownBarProps) => {
  const [label, setLabel] = useState('');
  const [progress, setProgress] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    const target = new Date(date).getTime();
    start.current = target - Date.now();

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setLabel('');
        setProgress(100);
        return;
      }
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      setLabel(`Faltan ${d} d ${h} h`);
      setProgress(100 - (diff / start.current) * 100);
    };

    update();
    const id = setInterval(update, 6e4);
    return () => clearInterval(id);
  }, [date]);

  const near = progress >= 90;
  const color = progress > 50 ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-2 flex-1 rounded bg-zinc-800">
        <div
          className={`h-full rounded ${color} transition-[width] duration-1000 ease-linear ${near ? 'animate-pulse' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-24 text-right text-xs text-gray-400">{label}</span>
    </div>
  );
};

export default CountdownBar;
