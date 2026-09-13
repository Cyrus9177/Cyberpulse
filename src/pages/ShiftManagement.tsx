import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '../utils/format';
import { generateId } from '../utils/ids';
import { User, DollarSign, Clock, FileText, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { Shift, AuditEntry } from '../store/types';

export default function ShiftManagement() {
  const { state, dispatch } = useAppContext();
  const { currentShift, shifts } = state;

  const [newCashierName, setNewCashierName] = useState('');
  const [newOpeningCash, setNewOpeningCash] = useState('');
  
  const [cashCountInput, setCashCountInput] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName || !newOpeningCash) return;

    const openingAmount = parseFloat(newOpeningCash);
    if (isNaN(openingAmount)) return;

    const now = new Date().toISOString();
    const startEntry: AuditEntry = {
      id: generateId(),
      timestamp: now,
      action: 'SHIFT_STARTED',
      details: `Shift started by ${newCashierName} with opening cash of ${formatCurrency(openingAmount)}`
    };

    const newShift: Shift = {
      id: generateId(),
      cashierId: generateId(),
      cashierName: newCashierName,
      startTime: now,
      endTime: null,
      openingCash: openingAmount,
      systemSales: 0,
      expectedCash: openingAmount,
      actualCash: null,
      variance: null,
      status: 'ACTIVE',
      auditLog: [startEntry]
    };

    dispatch({ type: 'START_SHIFT', shift: newShift });
    setNewCashierName('');
    setNewOpeningCash('');
  };

  const handleSubmitCashCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashCountInput) return;

    const actual = parseFloat(cashCountInput);
    if (isNaN(actual)) return;

    dispatch({ type: 'SUBMIT_CASH_COUNT', actualCash: actual });
    setShowResults(true);
  };

  const formatTimestamp = (iso: string) => {
    try {
      return formatDateTime(iso);
    } catch {
      return iso;
    }
  };

  // Safe checks for past shifts rendering
  const renderVariance = (variance: number | null) => {
    if (variance === null) return '-';
    if (variance < 0) return <span className="text-red-500 font-medium">{formatCurrency(variance)}</span>;
    if (variance === 0) return <span className="text-emerald-500 font-medium">{formatCurrency(variance)}</span>;
    return <span className="text-amber-500 font-medium">+{formatCurrency(variance)}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Shift Management</h1>

      {currentShift && currentShift.status === 'ACTIVE' && !showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card title="Current Shift Info">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <User className="text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-400">Cashier</p>
                      <p className="font-medium text-gray-200">{currentShift.cashierName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Clock className="text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-400">Started At</p>
                      <p className="font-medium text-gray-200">{formatTimestamp(currentShift.startTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-400">Opening Cash</p>
                      <p className="font-medium text-gray-200">{formatCurrency(currentShift.openingCash)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Activity className="text-cyan-500" />
                    <div>
                      <p className="text-sm text-gray-400">System-Recorded Sales</p>
                      <p className="font-medium text-gray-200">{formatCurrency(currentShift.systemSales)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Blind Cash Count" className="border-cyan-500/30">
              <form onSubmit={handleSubmitCashCount} className="space-y-4">
                <p className="text-sm text-gray-400">
                  Enter the physical cash counted at the end of your shift. Do not count expected amounts.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Physical Cash Count</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-8 pr-4 text-gray-100 focus:outline-none focus:border-cyan-500"
                      placeholder="0.00"
                      value={cashCountInput}
                      onChange={(e) => setCashCountInput(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  SUBMIT CASH COUNT
                </button>
              </form>
            </Card>
          </div>

          <div>
            <Card title="Shift Audit Log" className="h-full">
              <div className="relative pl-6 border-l-2 border-slate-700 space-y-6 mt-2">
                {currentShift.auditLog.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[33px] p-1 bg-slate-800 rounded-full border border-slate-600">
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cyan-400 mb-1">{formatTimestamp(entry.timestamp)}</p>
                      <p className="text-sm font-medium text-gray-200">{entry.action}</p>
                      <p className="text-sm text-gray-400 mt-1">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : currentShift && showResults ? (
        <Card title="Shift Accountability Results" className="border-cyan-500/50">
          <div className="space-y-6">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <h3 className="text-lg font-medium text-gray-200 mb-2">Shift Status</h3>
              <StatusBadge status={currentShift.status} size="md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Expected Cash</p>
                <p className="text-xl font-medium text-gray-200">{formatCurrency(currentShift.expectedCash)}</p>
                <p className="text-xs text-gray-500 mt-2">Opening Cash + System Sales</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Actual Cash (Counted)</p>
                <p className="text-xl font-medium text-gray-200">{formatCurrency(currentShift.actualCash || 0)}</p>
                <p className="text-xs text-gray-500 mt-2">Physical Cash Count</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Variance</p>
                <div className="text-xl">
                  {renderVariance(currentShift.variance)}
                </div>
                <p className="text-xs text-gray-500 mt-2">Actual - Expected</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Explanation
              </h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p>Recorded Transactions ({formatCurrency(currentShift.systemSales)}) + Opening Cash ({formatCurrency(currentShift.openingCash)}) = <strong>Expected Cash ({formatCurrency(currentShift.expectedCash)})</strong></p>
                <p className="text-center font-medium my-2 italic">vs</p>
                <p><strong>Physical Cash Count: {formatCurrency(currentShift.actualCash || 0)}</strong></p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setCashCountInput('');
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Start New Shift" className="max-w-md">
          <form onSubmit={handleStartShift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cashier Name</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
                placeholder="Enter name"
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Opening Cash</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-8 pr-4 text-gray-100 focus:outline-none focus:border-cyan-500"
                  placeholder="0.00"
                  value={newOpeningCash}
                  onChange={(e) => setNewOpeningCash(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              START SHIFT
            </button>
          </form>
        </Card>
      )}

      <Card title="Past Shifts">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-sm text-gray-400">
                <th className="pb-3 font-medium px-4">Cashier</th>
                <th className="pb-3 font-medium px-4">Started</th>
                <th className="pb-3 font-medium px-4">System Sales</th>
                <th className="pb-3 font-medium px-4">Expected</th>
                <th className="pb-3 font-medium px-4">Actual</th>
                <th className="pb-3 font-medium px-4">Variance</th>
                <th className="pb-3 font-medium px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                    No past shifts found.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-200">{shift.cashierName}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{formatTimestamp(shift.startTime)}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{formatCurrency(shift.systemSales)}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{formatCurrency(shift.expectedCash)}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{shift.actualCash !== null ? formatCurrency(shift.actualCash) : '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      {renderVariance(shift.variance)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={shift.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
