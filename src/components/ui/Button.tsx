import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const base = 'font-heading px-s-4 py-s-2 rounded transition-colors';

const variants: Record<string, string> = {
  primary: 'bg-vz-primary text-white hover:bg-vz-primary/90',
  secondary: 'bg-vz-surface text-white hover:bg-vz-surface/80',
  outline: 'border border-vz-primary text-vz-primary hover:bg-vz-primary hover:text-white',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const classes = `${base} ${variants[variant]} ${className}`.trim();
  return <button className={classes} {...props} />;
};

export default Button;
