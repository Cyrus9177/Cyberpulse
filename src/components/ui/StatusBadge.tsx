import React from 'react';
import type { PCStatus, SessionStatus, TransactionStatus, ShiftStatus } from '../../store/types';

type BadgeStatus = PCStatus | SessionStatus | TransactionStatus | ShiftStatus | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK' | 'ONLINE' | 'OFFLINE' | string;

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  IN_USE: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  SLEEPING: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  OFFLINE: 'bg-red-500/15 text-red-400 border-red-500/30',
  ACTIVE: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  COMPLETED: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/30',
  PAID: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  VOID: 'bg-red-500/15 text-red-400 border-red-500/30',
  BALANCED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CASH_SHORTAGE: 'bg-red-500/15 text-red-400 border-red-500/30',
  CASH_OVERAGE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  CLOSED: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  LOW_STOCK: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  OUT_OF_STOCK: 'bg-red-500/15 text-red-400 border-red-500/30',
  IN_STOCK: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  ONLINE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  ON: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  OFF: 'bg-red-500/15 text-red-400 border-red-500/30',
  SLEEP: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const DISPLAY_TEXT: Record<string, string> = {
  IN_USE: 'IN USE',
  CASH_SHORTAGE: 'CASH SHORTAGE',
  CASH_OVERAGE: 'CASH OVERAGE',
  LOW_STOCK: 'LOW STOCK',
  OUT_OF_STOCK: 'OUT OF STOCK',
  IN_STOCK: 'IN STOCK',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  const display = DISPLAY_TEXT[status] || status.replace(/_/g, ' ');
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${style} ${sizeClass}`}>
      {display}
    </span>
  );
}
