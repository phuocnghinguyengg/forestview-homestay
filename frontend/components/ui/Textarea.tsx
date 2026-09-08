import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helper,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const errorClass = error ? 'input-error' : '';
    const disabledClass = disabled ? 'input-disabled' : '';

    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        
        <textarea
          ref={ref}
          disabled={disabled}
          className={`input-base resize-none min-h-32 ${errorClass} ${disabledClass} ${className}`}
          {...props}
        />

        {error && <p className="form-error">{error}</p>}
        {helper && !error && <p className="form-helper">{helper}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
