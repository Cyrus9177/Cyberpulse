import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../utils/format';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Monitor, ShoppingBag, Clock } from 'lucide-react';

const Analytics: React.FC = () => {
  const { state } = useAppContext();

  // Simple aggregations for standard reporting
  const totalRevenue = useMemo(() => {
    return state.transactions.reduce((sum, tx) => sum + (tx.status === 'PAID' ? tx.grandTotal : 0), 0);
  }, [state.transactions]);

  const totalSessions = useMemo(() => {
    return state.sessions.length;
  }, [state.sessions]);

  // Mock hourly data for standard bar chart
  const hourlyData = [
    { hour: '8 AM', users: 5 },
    { hour: '10 AM', users: 12 },
    { hour: '12 PM', users: 25 },
    { hour: '2 PM', users: 18 },
    { hour: '4 PM', users: 30 },
    { hour: '6 PM', users: 28 },
    { hour: '8 PM', users: 15 }
  ];

  return (
    <div className="space-y-6 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-1">Standard business reporting and hourly traffic analysis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-700/50 bg-slate-800/50 backdrop-blur flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
          </div>
        </Card>
        <Card className="p-5 border-slate-700/50 bg-slate-800/50 backdrop-blur flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Sessions</p>
            <p className="text-2xl font-bold text-white">{totalSessions}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-700/50 bg-slate-800/50 backdrop-blur">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Peak Hours Traffic
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="users" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
