import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { formatCurrency, formatDateTime } from '../utils/format';

export default function Transactions() {
  const { state, dispatch } = useAppContext();
  const [dateFilter, setDateFilter] = useState('All');
  const [cashierFilter, setCashierFilter] = useState('All');
  const [pcFilter, setPcFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const cashiers = useMemo(() => Array.from(new Set(state.transactions.map(t => t.cashierName))), [state.transactions]);
  const pcs = useMemo(() => Array.from(new Set(state.transactions.map(t => t.pcName).filter(Boolean))), [state.transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...state.transactions];
    
    // Sort descending by timestamp
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (dateFilter === 'Today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(t => new Date(t.timestamp).toDateString() === today);
    } else if (dateFilter === 'Last 7 Days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.timestamp) >= sevenDaysAgo);
    }

    if (cashierFilter !== 'All') {
      filtered = filtered.filter(t => t.cashierName === cashierFilter);
    }
    if (pcFilter !== 'All') {
      filtered = filtered.filter(t => t.pcName === pcFilter);
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    return filtered;
  }, [state.transactions, dateFilter, cashierFilter, pcFilter, statusFilter]);

  const handleVoid = () => {
    if (selectedTx && selectedTx.status === 'PAID') {
      dispatch({ type: 'VOID_TRANSACTION', transactionId: selectedTx.id });
      setSelectedTx({ ...selectedTx, status: 'VOID' });
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Transactions">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cashier</label>
            <select 
              value={cashierFilter} 
              onChange={e => setCashierFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Cashiers</option>
              {cashiers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">PC</label>
            <select 
              value={pcFilter} 
              onChange={e => setPcFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All PCs</option>
              {pcs.map(p => <option key={p} value={p || ''}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="VOID">VOID</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 text-sm">
                <th className="py-3 px-4 font-medium">ID</th>
                <th className="py-3 px-4 font-medium">Date/Time</th>
                <th className="py-3 px-4 font-medium">Cashier</th>
                <th className="py-3 px-4 font-medium">PC</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="border-b border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors text-gray-200"
                >
                  <td className="py-3 px-4 font-mono text-cyan-500">{tx.displayId}</td>
                  <td className="py-3 px-4">{formatDateTime(tx.timestamp)}</td>
                  <td className="py-3 px-4">{tx.cashierName}</td>
                  <td className="py-3 px-4">{tx.pcName || '-'}</td>
                  <td className="py-3 px-4">{formatCurrency(tx.grandTotal)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={tx.status} size="sm" />
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        title="Transaction Details"
        size="lg"
      >
        {selectedTx && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-xl font-mono text-cyan-500">{selectedTx.displayId}</h3>
                <p className="text-sm text-gray-400">{formatDateTime(selectedTx.timestamp)}</p>
              </div>
              <StatusBadge status={selectedTx.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block mb-1">Cashier</span>
                <span className="text-gray-200 font-medium">{selectedTx.cashierName}</span>
              </div>
              {selectedTx.pcName && (
                <div>
                  <span className="text-gray-400 block mb-1">PC Session</span>
                  <span className="text-gray-200 font-medium">
                    {selectedTx.pcName} {selectedTx.sessionDurationMinutes ? `(${selectedTx.sessionDurationMinutes} min)` : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg p-4 space-y-3 border border-slate-700">
              <h4 className="font-medium text-gray-300 border-b border-slate-700 pb-2">Breakdown</h4>
              
              {selectedTx.pcCharge > 0 && (
                <div className="flex justify-between text-gray-200">
                  <span>PC Rental</span>
                  <span>{formatCurrency(selectedTx.pcCharge)}</span>
                </div>
              )}
              
              {selectedTx.snackItems && selectedTx.snackItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Snacks</span>
                  {selectedTx.snackItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-gray-200 pl-4 text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-700 pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg text-white">
                  <span>Grand Total</span>
                  <span className="text-cyan-500">{formatCurrency(selectedTx.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm mt-2">
                  <span>Payment Received</span>
                  <span>{formatCurrency(selectedTx.payment)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm mt-1">
                  <span>Change</span>
                  <span>{formatCurrency(selectedTx.change)}</span>
                </div>
              </div>
            </div>

            {selectedTx.status === 'PAID' && (
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleVoid}
                  className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-600/50"
                >
                  Void Transaction
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
