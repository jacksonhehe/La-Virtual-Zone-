import { useState } from 'react';

interface TileArgs {
  date: Date;
  view: string;
}

interface Props {
  value: Date;
  onChange: (value: Date) => void;
  tileContent?: (args: TileArgs) => React.ReactNode;
  className?: string;
}

const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const SimpleCalendar = ({ value, onChange, tileContent, className }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );

  const startDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const dates: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) dates.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }
  while (dates.length % 7 !== 0) dates.push(null);

  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <button
          className="text-sm px-2 py-1 rounded hover:bg-gray-700"
          onClick={prevMonth}
        >
          ‹
        </button>
        <span className="font-semibold">
          {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </span>
        <button
          className="text-sm px-2 py-1 rounded hover:bg-gray-700"
          onClick={nextMonth}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs mb-1">
        {weekdays.map(d => (
          <div key={d} className="font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center gap-1">
        {dates.map((date, i) => (
          <div
            key={i}
            className={`p-1 rounded cursor-pointer hover:bg-gray-700 ${
              date && date.toDateString() === value.toDateString()
                ? 'bg-blue-600 text-white'
                : 'text-gray-300'
            }`}
            onClick={() => date && onChange(date)}
          >
            {date && <div>{date.getDate()}</div>}
            {date && tileContent && (
              <div className="mt-1">{tileContent({ date, view: 'month' })}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleCalendar;
