import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      size = 'md',
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClass = 
      size === 'sm' ? 'input-sm' : 
      size === 'lg' ? 'input-lg' : '';
    
    const errorClass = error ? 'input-error' : '';
    const disabledClass = disabled ? 'input-disabled' : '';

    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-neutral-500 flex-shrink-0">
              {leftIcon}
            </span>
          )}
          
          <input
            ref={ref}
            disabled={disabled}
            className={`input-base ${sizeClass} ${errorClass} ${disabledClass} ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          
          {rightIcon && (
            <span className="absolute right-3 text-neutral-500 flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        {helper && !error && <p className="form-helper">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
