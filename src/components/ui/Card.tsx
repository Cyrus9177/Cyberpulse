import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  onClick?: () => void;
  noPadding?: boolean;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  headerRight,
  onClick,
  noPadding = false,
}: CardProps) {
  const hasHeader = title || subtitle || headerRight;

  return (
    <div
      className={`bg-slate-800/70 border border-slate-700/50 rounded-xl backdrop-blur-sm ${
        onClick ? 'cursor-pointer hover:border-cyan-500/30 hover:bg-slate-800 transition-all duration-200' : ''
      } ${className}`}
      onClick={onClick}
    >
      {hasHeader && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-200">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'px-5 pb-4 pt-2'}>{children}</div>
    </div>
  );
}
