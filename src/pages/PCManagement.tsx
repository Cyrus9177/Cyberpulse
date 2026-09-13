import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Play, Square, Plus, Moon, Activity, Clock, Wifi } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, formatTime, formatDateTime } from '../utils/format';
import { PC } from '../store/types';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function PCManagement() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [detailPC, setDetailPC] = useState<PC | null>(null);
  const [wolPC, setWolPC] = useState<PC | null>(null);
  const [wolLogs, setWolLogs] = useState<{time: string, msg: string}[]>([]);
  const [isWaking, setIsWaking] = useState(false);

  const handleStartSession = (pc: PC) => {
    navigate('/pos', { state: { selectedPcId: pc.id } });
  };

  const handleEndSession = (pc: PC) => {
    if (pc.currentSessionId) {
      dispatch({ type: 'END_SESSION', sessionId: pc.currentSessionId });
    }
  };

  const handleAddTime = (pc: PC) => {
    if (pc.currentSessionId) {
      dispatch({ 
        type: 'EXTEND_SESSION', 
        sessionId: pc.currentSessionId, 
        minutes: 30, 
        amount: state.settings.ratePerHour / 2 
      });
    }
  };

  const handleSleep = (pc: PC) => {
    dispatch({ type: 'SLEEP_PC', pcId: pc.id });
  };

  const handleWake = (pc: PC) => {
    setWolPC(pc);
    setWolLogs([{ time: new Date().toISOString(), msg: `Connecting to ${pc.name}` }]);
    setIsWaking(true);
    
    setTimeout(() => {
      setWolLogs(prev => [...prev, { time: new Date().toISOString(), msg: `${pc.name} responded...` }]);
    }, 2000);
    
    setTimeout(() => {
      setWolLogs(prev => [...prev, { time: new Date().toISOString(), msg: `${pc.name} status: AVAILABLE` }]);
      dispatch({ type: 'WAKE_PC', pcId: pc.id });
      setIsWaking(false);
    }, 3000);
  };

  const closeWolModal = () => {
    if (!isWaking) {
      setWolPC(null);
      setWolLogs([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Monitor className="w-6 h-6 text-cyan-500" />
          PC Management
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {state.pcs.map(pc => {
          const session = pc.currentSessionId ? state.sessions.find(s => s.id === pc.currentSessionId) : null;
          
          return (
            <Card key={pc.id} className="flex flex-col h-full border-t-4 border-slate-700 hover:border-cyan-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">{pc.name}</h3>
                  <div className="text-xs text-gray-400 mt-1">{pc.ipAddress}</div>
                </div>
                <StatusBadge status={pc.status} />
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {pc.status === 'IN_USE' && session && (
                  <div className="bg-slate-800/50 p-3 rounded border border-cyan-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Remaining Time</span>
                      <span className="text-sm font-mono text-cyan-400 font-bold">{formatTime(session.remainingSeconds)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Current Revenue</span>
                      <span className="text-sm text-emerald-400">{formatCurrency(session.revenue)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Power: <span className="text-gray-200">{pc.powerState}</span></div>
                  <div className="text-gray-400">Net: <span className="text-gray-200">{pc.networkStatus}</span></div>
                  <div className="text-gray-400 col-span-2">Last Activity: <span className="text-gray-200">{timeAgo(pc.lastActivity)}</span></div>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                {pc.status === 'AVAILABLE' && (
                  <>
                    <button onClick={() => handleStartSession(pc)} className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded text-sm transition-colors">
                      <Play className="w-4 h-4" /> Start
                    </button>
                    <button onClick={() => handleSleep(pc)} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded text-sm transition-colors">
                      <Moon className="w-4 h-4" /> Sleep
                    </button>
                  </>
                )}
                {pc.status === 'IN_USE' && (
                  <>
                    <button onClick={() => handleAddTime(pc)} className="flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded text-sm transition-colors">
                      <Plus className="w-4 h-4" /> +30m
                    </button>
                    <button onClick={() => handleEndSession(pc)} className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-500 text-white p-2 rounded text-sm transition-colors">
                      <Square className="w-4 h-4" /> End
                    </button>
                  </>
                )}
                {pc.status === 'SLEEPING' && (
                  <button onClick={() => handleWake(pc)} className="col-span-2 flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-500 text-white p-2 rounded text-sm transition-colors">
                    <Activity className="w-4 h-4" /> Wake PC
                  </button>
                )}
                {pc.status === 'OFFLINE' && (
                  <button disabled className="col-span-2 flex items-center justify-center gap-1 bg-slate-800 text-slate-500 p-2 rounded text-sm cursor-not-allowed">
                    <Wifi className="w-4 h-4" /> Offline
                  </button>
                )}
                <button onClick={() => setDetailPC(pc)} className="col-span-2 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-gray-300 p-2 rounded text-sm transition-colors border border-slate-700">
                  View Details
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={!!wolPC} onClose={closeWolModal} title="Starting PC">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 py-6 text-gray-400">
            <div className="flex flex-col items-center">
              <Monitor className="w-8 h-8 text-cyan-500 mb-2" />
              <span className="text-xs">Server</span>
            </div>
            <div className={`flex-1 h-0.5 ${isWaking ? 'bg-cyan-500/50 animate-pulse' : 'bg-slate-700'} relative`}>
               {isWaking && <div className="absolute top-0 left-0 h-full bg-cyan-400 w-1/3 animate-[ping_1.5s_ease-in-out_infinite]" />}
            </div>
            <div className="flex flex-col items-center">
              <Monitor className={`w-8 h-8 ${isWaking ? 'text-slate-500' : 'text-emerald-500'} mb-2`} />
              <span className="text-xs">{wolPC?.name}</span>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded p-4 font-mono text-sm space-y-2 h-40 overflow-y-auto">
            {wolLogs.map((log, i) => (
              <div key={i} className="text-gray-300">
                <span className="text-slate-500">[{new Date(log.time).toLocaleTimeString()}]</span>{' '}
                <span className={i === wolLogs.length - 1 && !isWaking ? 'text-emerald-400' : 'text-cyan-400'}>
                  {log.msg}
                </span>
              </div>
            ))}
            {isWaking && <div className="text-gray-500 animate-pulse">_</div>}
          </div>
          
          {!isWaking && (
            <button onClick={closeWolModal} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors">
              Close
            </button>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!detailPC} onClose={() => setDetailPC(null)} title={`PC Info: ${detailPC?.name}`} size="lg">
        {detailPC && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800 p-4 rounded-lg">
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className="mt-1"><StatusBadge status={detailPC.status} /></div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Power State</div>
                <div className="mt-1 font-semibold text-gray-200">{detailPC.powerState}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">IP Address</div>
                <div className="mt-1 font-mono text-sm text-cyan-400">{detailPC.ipAddress}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">MAC Address</div>
                <div className="mt-1 font-mono text-sm text-cyan-400">{detailPC.macAddress}</div>
              </div>
            </div>

            {detailPC.status === 'IN_USE' && detailPC.currentSessionId && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Current Session</h3>
                {(() => {
                  const s = state.sessions.find(s => s.id === detailPC.currentSessionId);
                  return s ? (
                    <div className="bg-slate-800 border border-cyan-500/30 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-400">Txn ID</div>
                        <div className="font-mono text-sm text-gray-200">{s.transactionId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Started</div>
                        <div className="text-sm text-gray-200">{new Date(s.startTime).toLocaleTimeString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Time Left</div>
                        <div className="font-mono text-cyan-400 font-bold">{formatTime(s.remainingSeconds)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Revenue</div>
                        <div className="text-emerald-400 font-bold">{formatCurrency(s.revenue)}</div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Session History
              </h3>
              <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-800 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Txn ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Revenue</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.sessions.filter(s => s.pcId === detailPC.id && s.id !== detailPC.currentSessionId).slice(0, 5).map(s => (
                      <tr key={s.id} className="border-t border-slate-700/50 hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-xs">{s.transactionId}</td>
                        <td className="px-4 py-3 text-gray-300">{formatDateTime(s.startTime)}</td>
                        <td className="px-4 py-3 text-gray-300">{s.durationMinutes}m</td>
                        <td className="px-4 py-3 text-emerald-400">{formatCurrency(s.revenue)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${s.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {state.sessions.filter(s => s.pcId === detailPC.id && s.id !== detailPC.currentSessionId).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No previous sessions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

