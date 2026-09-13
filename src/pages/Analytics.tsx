import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import Card from '../components/ui/Card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  generateHourlyRevenue, generatePCUtilization, generatePeakHours, generateSnackSalesData 
} from '../store/initialData';
import { generateForecast, getDemandColor, getDemandBg } from '../utils/forecast';
import { formatCurrency } from '../utils/format';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-gray-300 text-sm font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name.includes('Revenue') ? formatCurrency(p.value) : p.name.includes('Utilization') || p.name.includes('Demand') ? `${p.value}%` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { state } = useAppContext();

  // Generate mock data once
  const revenueData = useMemo(() => generateHourlyRevenue(), []);
  const utilizationData = useMemo(() => generatePCUtilization(), []);
  const peakHoursData = useMemo(() => generatePeakHours(), []);
  const snackSalesData = useMemo(() => generateSnackSalesData(), []);
  const forecastData = useMemo(() => generateForecast(), []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Analytics & Forecasting</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue by Hour">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `₱${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="pcRevenue" name="PC Revenue" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="snackRevenue" name="Snack Revenue" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="PC Utilization">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="pcName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="utilization" name="Utilization" radius={[4, 4, 0, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.utilization > 80 ? '#10b981' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Best-Selling Products">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snackSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="product" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="units" name="Units Sold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Peak Hours — Demand %">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="demand" name="Demand" radius={[4, 4, 0, 0]}>
                  {peakHoursData.map((entry, index) => {
                    let fill = '#10b981'; // LOW (green)
                    if (entry.demand >= 85) fill = '#ef4444'; // VERY HIGH (red)
                    else if (entry.demand >= 70) fill = '#f97316'; // HIGH (orange)
                    else if (entry.demand >= 45) fill = '#f59e0b'; // MEDIUM (amber)
                    
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card 
        title="CyberPulse Demand Forecast — Prototype" 
        subtitle="Mock prediction based on historical sample data. This is a prototype forecast and does not use real machine learning."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {forecastData.map((prediction, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <p className="text-gray-300 font-medium">{prediction.label}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${getDemandBg(prediction.demand)} ${getDemandColor(prediction.demand)}`}>
                  {prediction.demand}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Confidence</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full" 
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-cyan-400">{prediction.confidence}%</p>
              </div>

              <div className="mt-auto">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Factors</p>
                <ul className="space-y-1">
                  {prediction.factors.map((factor, fIdx) => (
                    <li key={fIdx} className="text-sm text-gray-300 flex items-center gap-2 before:content-[''] before:block before:w-1 before:h-1 before:bg-gray-500 before:rounded-full">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
