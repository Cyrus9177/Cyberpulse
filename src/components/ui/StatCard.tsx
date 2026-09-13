import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'cyan' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  small?: boolean;
}

const COLOR_MAP = {
  cyan: {
    icon: 'bg-cyan-500/15 text-cyan-400',
    border: 'border-cyan-500/20',
  },
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-400',
    border: 'border-emerald-500/20',
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-400',
    border: 'border-amber-500/20',
  },
  red: {
    icon: 'bg-red-500/15 text-red-400',
    border: 'border-red-500/20',
  },
  blue: {
    icon: 'bg-blue-500/15 text-blue-400',
    border: 'border-blue-500/20',
  },
  purple: {
    icon: 'bg-purple-500/15 text-purple-400',
    border: 'border-purple-500/20',
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = 'cyan',
  trend,
  trendLabel,
  small = false,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className={`bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 ${colors.border} hover:border-opacity-60 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className={`${small ? 'text-xl' : 'text-2xl'} font-bold text-gray-100 mt-1`}>{value}</p>
          {trend && trendLabel && (
            <p className={`text-xs mt-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${colors.icon} shrink-0`}>
          <Icon size={small ? 18 : 22} />
        </div>
      </div>
    </div>
  );
}
