import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { SidebarToggle } from './Sidebar';
import { useAppContext } from '../../store/AppContext';
import { Clock, User } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cashierName = state.currentShift?.cashierName ?? 'No Active Shift';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={14} />
              <span className="font-mono text-gray-300">
                {currentTime.toLocaleTimeString('en-PH', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-cyan-500/15 flex items-center justify-center">
                <User size={14} className="text-cyan-400" />
              </div>
              <span className="text-gray-300 font-medium">{cashierName}</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
