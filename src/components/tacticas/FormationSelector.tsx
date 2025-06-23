interface FormationSelectorProps {
  value: string;
  onChange: (f: string) => void;
}

const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'];

const FormationSelector = ({ value, onChange }: FormationSelectorProps) => (
  <select
    className="p-2 rounded bg-gray-800"
    value={value}
    onChange={e => onChange(e.target.value)}
  >
    {formations.map(f => (
      <option key={f} value={f}>
        {f}
      </option>
    ))}
  </select>
);

export default FormationSelector;
