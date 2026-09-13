import React, { useState, useMemo } from 'react';
import { Monitor, MonitorPlay, MonitorCheck, Moon, DollarSign, UtensilsCrossed, AlertTriangle, Activity } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { formatCurrency, formatTime } from '../utils/format';
import type { PC } from '../store/types';

export default function Dashboard() {
  const { state } = useAppContext();
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);

  const stats = useMemo(() => {
    const totalPCs = state.pcs.length;
    const inUsePCs = state.pcs.filter(pc => pc.status === 'IN_USE').length;
    const availablePCs = state.pcs.filter(pc => pc.status === 'AVAILABLE').length;
    const sleepingPCs = state.pcs.filter(pc => pc.status === 'SLEEPING').length;
    
    // Revenue calculations
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = state.transactions.filter(t => t.timestamp?.startsWith(today) && t.status === 'PAID');
    const pcRevenue = todayTransactions.reduce((sum, t) => sum + t.pcCharge, 0);
    const snackRevenue = todayTransactions.reduce((sum, t) => sum + t.snackTotal, 0);
    const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
    
    const alerts = state.products.filter(p => p.stock <= p.reorderLevel).length;
    
    return { totalPCs, inUsePCs, availablePCs, sleepingPCs, pcRevenue, snackRevenue, totalRevenue, alerts };
  }, [state.pcs, state.transactions, state.products]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
        <Activity className="w-6 h-6 text-cyan-500" />
        System Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total PCs" value={stats.totalPCs} icon={Monitor} color="blue" />
        <StatCard label="PCs In Use" value={stats.inUsePCs} icon={MonitorPlay} color="cyan" />
        <StatCard label="Available" value={stats.availablePCs} icon={MonitorCheck} color="emerald" />
        <StatCard label="Sleeping" value={stats.sleepingPCs} icon={Moon} />
        
        <StatCard label="Today's Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="emerald" />
        <StatCard label="PC Sessions" value={formatCurrency(stats.pcRevenue)} icon={Monitor} color="cyan" />
        <StatCard label="Snacks & Food" value={formatCurrency(stats.snackRevenue)} icon={UtensilsCrossed} color="amber" />
        <StatCard label="Inventory Alerts" value={stats.alerts} icon={AlertTriangle} color={stats.alerts > 0 ? 'red' : 'emerald'} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">PC Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {state.pcs.map(pc => {
            const session = pc.currentSessionId ? state.sessions.find(s => s.id === pc.currentSessionId) : null;
            let borderClass = 'border-gray-700';
            if (pc.status === 'AVAILABLE') borderClass = 'border-emerald-500/50';
            if (pc.status === 'IN_USE') borderClass = 'border-cyan-500/50';
            if (pc.status === 'SLEEPING') borderClass = 'border-slate-600';
            if (pc.status === 'OFFLINE') borderClass = 'border-red-500/50';

            return (
              <div 
                key={pc.id} 
                className={`bg-slate-800 border-2 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors ${borderClass}`}
                onClick={() => setSelectedPC(pc)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-100">{pc.name}</span>
                  <StatusBadge status={pc.status} size="sm" />
                </div>
                
                <div className="text-sm text-gray-400 mt-2 h-10">
                  {pc.status === 'IN_USE' && session && (
                    <>
                      <div className="text-cyan-400 font-mono">{formatTime(session.remainingSeconds)}</div>
                      <div className="text-emerald-400">{formatCurrency(session.revenue)}</div>
                    </>
                  )}
                  {pc.status === 'AVAILABLE' && <div className="text-emerald-500">Ready</div>}
                  {pc.status === 'SLEEPING' && <div className="text-slate-400">Power saving</div>}
                  {pc.status === 'OFFLINE' && <div className="text-red-400">Offline</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card title="System Status" className="border-t-4 border-t-emerald-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500">{stats.inUsePCs}</div>
              <div className="text-sm text-gray-400">Active PCs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">{stats.sleepingPCs}</div>
              <div className="text-sm text-gray-400">Sleeping PCs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">{stats.availablePCs}</div>
              <div className="text-sm text-gray-400">Available PCs</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-100 flex items-center justify-end gap-2">
              Power Saving Mode: 
              <span className={stats.sleepingPCs > 0 ? 'text-emerald-500' : 'text-gray-500'}>
                {stats.sleepingPCs > 0 ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Sleeping PCs consume 95% less energy.
            </div>
          </div>
        </div>
      </Card>

      <Modal isOpen={!!selectedPC} onClose={() => setSelectedPC(null)} title={`PC Details: ${selectedPC?.name}`}>
        {selectedPC && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div className="mt-1"><StatusBadge status={selectedPC.status} /></div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Power State</div>
                <div className="text-gray-100">{selectedPC.powerState}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">IP Address</div>
                <div className="text-gray-100 font-mono">{selectedPC.ipAddress}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">MAC Address</div>
                <div className="text-gray-100 font-mono">{selectedPC.macAddress}</div>
              </div>
            </div>
            {selectedPC.status === 'IN_USE' && (
              <div className="bg-slate-800 p-4 rounded-lg mt-4 border border-cyan-500/30">
                <h3 className="font-semibold text-cyan-400 mb-2">Current Session</h3>
                {(() => {
                  const s = state.sessions.find(s => s.id === selectedPC.currentSessionId);
                  return s ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Time Remaining:</div>
                      <div className="text-cyan-400 font-mono">{formatTime(s.remainingSeconds)}</div>
                      <div className="text-gray-400">Revenue:</div>
                      <div className="text-emerald-400">{formatCurrency(s.revenue)}</div>
                    </div>
                  ) : <div className="text-gray-400">No session data</div>;
                })()}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

