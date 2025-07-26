import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25',
  outline: 'border border-gray-600 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600',
  secondary: 'bg-gray-700 text-white hover:bg-gray-600',
  danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-red-500/25',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading, children, className, ...props }) => {
  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span> : null}
      {children}
    </button>
  );
};

export default Button; 