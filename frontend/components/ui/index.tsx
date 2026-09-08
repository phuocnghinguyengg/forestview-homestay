import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
}) => {
  const variantClass = `badge-${variant}`;
  
  return (
    <span className={`${variantClass} ${className}`}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};

interface CardProps {
  variant?: 'default' | 'hover' | 'elevated' | 'interactive';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  onClick,
}) => {
  const variantClass = 
    variant === 'hover' ? 'card-hover' :
    variant === 'elevated' ? 'card-elevated' :
    variant === 'interactive' ? 'card-interactive' :
    'card';

  return (
    <div className={`${variantClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  icon,
  title,
  children,
  onClose,
  className = '',
}) => {
  const variantClass = `alert-${variant}`;

  return (
    <div className={`alert ${variantClass} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 ml-2 hover:opacity-70 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};
