import React, { useMemo } from "react";
import Image from "@/components/ui/Image";

type Props = {
  src?: string | null;
  name?: string | null;
  size?: number;            // px
  className?: string;
  rounded?: boolean;        // true -> rounded-full
  alt?: string;
};

const SmartAvatar: React.FC<Props> = ({
  src,
  name,
  size = 40,
  className = "",
  rounded = true,
  alt,
}) => {
  // Generar iniciales
  const initials = useMemo(() => {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
    return (first + last).toUpperCase() || "U";
  }, [name]);

  const wrapperStyle: React.CSSProperties = { width: size, height: size };
  const radius = rounded ? "50%" : undefined;
  const label = alt ?? (name ? `${name}'s avatar` : "avatar");

  // Si no hay src, mostrar iniciales
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white ${className || ""}`}
        style={{ ...wrapperStyle, borderRadius: radius }}
        aria-label={label}
        title={label}
      >
        <span style={{ fontSize: Math.max(12, Math.floor(size * 0.4)) }}>{initials}</span>
      </div>
    );
  }

  // Si hay src, mostrar la imagen
  return (
    <div
      className={`${className || ""}`}
      style={{ ...wrapperStyle, borderRadius: radius, overflow: 'hidden', position: 'relative' }}
    >
      <Image
        src={src}
        alt={label}
        width={size}
        height={size}
        className={`w-full h-full object-cover ${rounded ? 'rounded-full' : 'rounded'}`}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default SmartAvatar;
