import { useEffect, useRef, useState } from 'react';

interface Item {
  label: string;
  onSelect: () => void;
  hidden?: boolean;
}

interface Props {
  items: Item[];
  children: React.ReactNode;
}

const DropdownMenu = ({ items, children }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{children}</div>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-white/20 z-20">
          {items.filter(i => !i.hidden).map(item => (
            <button
              key={item.label}
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
