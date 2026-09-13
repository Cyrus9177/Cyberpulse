import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import PCManagement from './pages/PCManagement';
import POSCashier from './pages/POSCashier';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import ShiftManagement from './pages/ShiftManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pc-management" element={<PCManagement />} />
            <Route path="/pos" element={<POSCashier />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/shifts" element={<ShiftManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
