import React, { useState, useRef, useEffect } from 'react';

export interface PopoverTriggerRef {
  open: () => void;
  close: () => void;
}

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  closeOnClickOutside?: boolean;
}

export const Popover = React.forwardRef<PopoverTriggerRef, PopoverProps>(
  (
    {
      trigger,
      children,
      placement = 'bottom',
      closeOnClickOutside = true,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      React.useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }));
    }, [ref]);

    useEffect(() => {
      if (!closeOnClickOutside) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, closeOnClickOutside]);

    const placementClasses = {
      bottom: 'top-full mt-2 left-0',
      top: 'bottom-full mb-2 left-0',
      right: 'left-full ml-2 top-0',
      left: 'right-full mr-2 top-0',
    };

    return (
      <div ref={containerRef} className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center"
        >
          {trigger}
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className={`absolute ${placementClasses[placement]} bg-surface border border-line rounded-xl shadow-lg z-50 animate-slideUp`}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = 'Popover';
