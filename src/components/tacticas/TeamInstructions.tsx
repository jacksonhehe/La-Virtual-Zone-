interface TeamInstructionsProps {
  values: Instructions;
  onChange: (v: Instructions) => void;
}

export interface Instructions {
  possession: number;
  pressure: number;
  width: number;
  line: number;
}

const Slider = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="mb-4">
    <label className="block text-sm mb-1">
      {label}: {value}
    </label>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

const TeamInstructions = ({ values, onChange }: TeamInstructionsProps) => (
  <div className="p-4 bg-gray-800 rounded">
    <Slider label="Posesión" value={values.possession} onChange={v => onChange({ ...values, possession: v })} />
    <Slider label="Presión" value={values.pressure} onChange={v => onChange({ ...values, pressure: v })} />
    <Slider label="Anchura" value={values.width} onChange={v => onChange({ ...values, width: v })} />
    <Slider label="Línea" value={values.line} onChange={v => onChange({ ...values, line: v })} />
  </div>
);

export default TeamInstructions;
