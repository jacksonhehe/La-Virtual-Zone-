interface SynergyIndicatorProps {
  value: number;
}

const SynergyIndicator = ({ value }: SynergyIndicatorProps) => {
  const color = value > 70 ? 'text-green-400' : value > 40 ? 'text-yellow-400' : 'text-red-400';
  return <div className={color}>Sinergia: {value}%</div>;
};

export default SynergyIndicator;
