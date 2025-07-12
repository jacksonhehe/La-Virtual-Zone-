import  { Search, Filter } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  filters?: { label: string; value: string; options: { label: string; value: string }[] }[];
  onFilterChange?: (filterValue: string, value: string) => void;
  placeholder?: string;
}

const SearchFilter = ({ search, onSearchChange, filters, onFilterChange, placeholder = "Buscar..." }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          className="input pl-12 w-full"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {filters && filters.map((filter) => (
        <div key={filter.value} className="glass-panel p-3">
          <select
            className="input bg-transparent border-none min-w-[150px]"
            value={filter.value}
            onChange={(e) => onFilterChange?.(filter.value, e.target.value)}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default SearchFilter;
 