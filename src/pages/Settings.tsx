import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { clearState } from '../store/localStorage';
import { Save, AlertTriangle, Info } from 'lucide-react';

export default function Settings() {
  const { state, dispatch } = useAppContext();
  
  const [shopName, setShopName] = useState(state.settings.shopName);
  const [ratePerHour, setRatePerHour] = useState<number | string>(state.settings.ratePerHour);
  const [currency, setCurrency] = useState(state.settings.currency);
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveSettings = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      settings: {
        shopName,
        ratePerHour: Number(ratePerHour),
        currency
      }
    });
  };

  const handleResetData = () => {
    clearState();
    dispatch({ type: 'RESET_DATA' });
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card title="Shop Settings" className="border border-slate-700">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                PC Rate per Hour
              </label>
              <input
                type="number"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSaveSettings}
              className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </Card>

      <Card title="System" className="border border-slate-700 border-l-red-500 border-l-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-100 font-medium">Reset Demo Data</h3>
            <p className="text-sm text-gray-400 mt-1">This will permanently delete all current transactions, sessions, and reset to demo state.</p>
          </div>
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-600/50"
          >
            Reset Data
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-sm text-gray-500 font-mono">CyberPulse v0.1 — Prototype</p>
        </div>
      </Card>

      <Card title="About" className="border border-slate-700">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-800 rounded-lg text-cyan-500">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">IT System Integration Project</h3>
            <p className="text-gray-400 mt-2">
              CyberPulse is an integrated computer shop management system prototype. 
              Built with React, TypeScript, and Tailwind CSS.
            </p>
          </div>
        </div>
      </Card>

      <Modal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        title="Confirm Reset"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-red-500 mb-4 bg-red-500/10 p-4 rounded-lg">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">Warning: This action cannot be undone.</p>
          </div>
          <p className="text-gray-300">
            Are you sure you want to reset all demo data? All transactions, settings, and shift history will be wiped and restored to default values.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleResetData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Yes, Reset Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
