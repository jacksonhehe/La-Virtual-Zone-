import React from 'react';

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  decoding?: 'sync' | 'async' | 'auto';
  loading?: 'eager' | 'lazy';
  style?: React.CSSProperties;
  onError?: () => void;
  onLoad?: () => void;
}

export default function Image({
  src,
  alt,
  width,
  height,
  className,
  decoding = 'async',
  loading = 'lazy',
  style,
  onError,
  onLoad
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      {...(width ? { width } : {})}
      {...(height ? { height } : {})}
      decoding={decoding}
      loading={loading}
      className={className}
      style={style}
      onError={onError}
      onLoad={onLoad}
    />
  );
}
