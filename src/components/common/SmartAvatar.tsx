import React, { useMemo, useState } from "react";
import Image from '@/components/ui/Image';

type Props = {
  src?: string | null;
  name?: string | null;
  size?: number;            // px
  className?: string;
  rounded?: boolean;        // true -> rounded-full
  alt?: string;
};

/**
 * SmartAvatar
 * 1) Tries the given src
 * 2) Falls back to ui-avatars (based on `name`)
 * 3) Falls back to /default-avatar.png (put a file in public/ if you want a custom default)
 * 4) If even that fails, shows initials on a colored circle
 */
const LOCAL_DEFAULT = "/default-avatar.png";

const SmartAvatar: React.FC<Props> = ({
  src,
  name,
  size = 40,
  className = "",
  rounded = true,
  alt,
}) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const uiAvatarUrl = useMemo(() => {
    const n = (name ?? "").trim() || "User";
    const encoded = encodeURIComponent(n);
    return `https://ui-avatars.com/api/?name=${encoded}&bold=true&size=${Math.max(size, 64)}`;
  }, [name, size]);

  const currentSrc = useMemo(() => {
    if (step === 0) return src || "";
    if (step === 1) return uiAvatarUrl;
    return LOCAL_DEFAULT;
  }, [step, src, uiAvatarUrl]);

  const label = alt ?? (name ? `${name}'s avatar` : "avatar");
  const radius = rounded ? "50%" : undefined;

  const handleError = () => {
    setStep((prev) => (prev < 2 ? ((prev + 1) as 0 | 1 | 2) : prev));
  };

  // When images fail entirely, render initials in a circle
  const initials = useMemo(() => {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
    return (first + last).toUpperCase() || "U";
  }, [name]);

  const wrapperStyle: React.CSSProperties = { width: size, height: size };

  if (!currentSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-700 text-white ${className || ""}`}
        style={{ ...wrapperStyle, borderRadius: radius }}
        aria-label={label}
        title={label}
      >
        <span style={{ fontSize: Math.max(12, Math.floor(size * 0.4)) }}>{initials}</span>
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={label}
      width={size}
      height={size}
      onError={handleError}
      className={`${rounded ? 'rounded-full' : 'rounded'} object-cover ${className || ''}`}
      style={{ width: size, height: size }}
    />
  );
};

export default SmartAvatar;
