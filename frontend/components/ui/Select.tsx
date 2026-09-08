import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'Chọn một tùy chọn',
      error,
      helper,
      disabled = false,
      size = 'md',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const sizeClass = 
      size === 'sm' ? 'text-sm' : 
      size === 'lg' ? 'text-lg' : '';

    return (
      <div ref={ref || containerRef} className="form-group">
        {label && <label className="form-label">{label}</label>}

        <div
          className={`relative ${error ? 'input-error' : ''} ${sizeClass}`}
        >
          <button
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`input-base w-full text-left flex items-center justify-between ${
              disabled ? 'input-disabled' : ''
            }`}
          >
            <span className={selectedOption ? 'text-ink' : 'text-neutral-500'}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className="dropdown-menu animate-slideDown">
              {options.length === 0 ? (
                <div className="dropdown-item text-neutral-500">Không có tùy chọn</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`dropdown-item w-full text-left ${
                      option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${value === option.value ? 'dropdown-item-active' : ''}`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        {helper && !error && <p className="form-helper">{helper}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
