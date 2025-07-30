import React from 'react';

export interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  decoding?: 'sync' | 'async' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  style?: React.CSSProperties;
}

export default function Image({
  src,
  alt,
  width,
  height,
  className,
  decoding = 'async',
  fetchPriority = 'auto',
  loading = 'lazy',
  style
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      decoding={decoding}
      fetchPriority={fetchPriority}
      loading={loading}
      className={className}
      style={style}
    />
  );
}
