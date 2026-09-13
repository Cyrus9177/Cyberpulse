import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  ShoppingCart,
  Package,
  Receipt,
  UserCog,
  BarChart3,
  Settings,
  Zap,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pc-management', icon: Monitor, label: 'PC Management' },
  { to: '/pos', icon: ShoppingCart, label: 'POS / Cashier' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/shifts', icon: UserCog, label: 'Shift Management' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-slate-900 border-r border-slate-700/50 flex flex-col transition-transform duration-300
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/15">
            <Zap size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">
              Cyber<span className="text-cyan-400">Pulse</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
              Shop Management
            </p>
          </div>
          <button
            onClick={onToggle}
            className="ml-auto lg:hidden p-1 text-gray-400 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) onToggle();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800 border border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700/50">
          <p className="text-[10px] text-gray-600 text-center">
            CyberPulse v0.1 — Prototype
          </p>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-slate-800 transition-colors"
    >
      <Menu size={20} />
    </button>
  );
}
