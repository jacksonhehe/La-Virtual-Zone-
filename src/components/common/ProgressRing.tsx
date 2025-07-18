import React from 'react';

interface ProgressRingProps {
  /** Porcentaje entre 0 y 100 */
  value: number;
  /** Radio interno del anillo (sin stroke) */
  radius?: number;
  /** Grosor del stroke */
  stroke?: number;
  /** Color del anillo activo */
  color?: string;
  /** Texto opcional en el centro (si no se pasa, se muestra el % redondeado) */
  label?: string;
}

/*
  Renderiza un anillo circular basado en SVG. Usa las variables Tailwind para color si se pasa un nombre (ej: 'primary').
*/
const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  radius = 40,
  stroke = 8,
  color = 'var(--primary)',
  label
}) => {
  const normalized = Math.min(Math.max(value, 0), 100);
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="block"
      role="img"
      aria-label={`Progreso ${normalized}%`}
    >
      <circle
        stroke="rgba(255,255,255,0.1)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeLinecap="round"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-semibold text-sm text-white select-none"
      >
        {label ?? `${Math.round(normalized)}%`}
      </text>
    </svg>
  );
};

export default ProgressRing; 