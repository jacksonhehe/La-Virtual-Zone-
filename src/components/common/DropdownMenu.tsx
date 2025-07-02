import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownContextValue | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray[0];
  const items = childrenArray.slice(1);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {trigger}
        {open && (
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1" role="menu">
              {items}
            </div>
          </div>
        )}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenuTrigger = ({
  children,
  className,
  onClick,
  ...props
}: DropdownMenuTriggerProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }
  const { open, setOpen } = context;
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setOpen(!open);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-haspopup="true"
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}

export const DropdownMenuItem = ({ children, onSelect, className }: DropdownMenuItemProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuItem must be used within DropdownMenu');
  }
  const { setOpen } = context;
  const handleClick = () => {
    onSelect?.();
    setOpen(false);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white ${className ?? ''}`.trim()}
      role="menuitem"
    >
      {children}
    </button>
  );
};

export default DropdownMenu;
