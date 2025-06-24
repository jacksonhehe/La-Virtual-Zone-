interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterChip = ({ label, active, onClick }: FilterChipProps) => (
  <button
    onClick={onClick}
    className={`rounded-full px-3 py-1 text-xs ${
      active
        ? 'bg-accent text-black'
        : 'bg-white/10 text-gray-300 hover:bg-white/20'
    } focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-accent`}
  >
    {label}
  </button>
);

export default FilterChip;
