import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Package, AlertTriangle, XCircle, TrendingUp, Edit2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { formatCurrency } from '../utils/format';

export default function Inventory() {
  const { state, dispatch } = useAppContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number | string>('');

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setNewStock(product.stock);
    setIsEditModalOpen(true);
  };

  const handleSaveStock = () => {
    if (editingProduct && newStock !== '') {
      dispatch({ 
        type: 'UPDATE_STOCK', 
        productId: editingProduct.id, 
        newStock: Number(newStock) 
      });
      setIsEditModalOpen(false);
    }
  };

  const stats = useMemo(() => {
    let lowStock = 0;
    let outOfStock = 0;
    let unitsSold = 0;
    
    state.products.forEach(p => {
      if (p.stock === 0) outOfStock++;
      else if (p.stock <= p.reorderLevel) lowStock++;
      unitsSold += p.todaySold;
    });

    return {
      total: state.products.length,
      lowStock,
      outOfStock,
      unitsSold
    };
  }, [state.products]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats.total} icon={Package} />
        <StatCard label="Low Stock Items" value={stats.lowStock} icon={AlertTriangle} color="amber" />
        <StatCard label="Out of Stock" value={stats.outOfStock} icon={XCircle} color="red" />
        <StatCard label="Today's Units Sold" value={stats.unitsSold} icon={TrendingUp} color="emerald" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.products.map(product => {
          let statusStr = 'IN_STOCK';
          let statusBadgeStatus: 'success' | 'warning' | 'error' = 'success';
          
          if (product.stock === 0) {
            statusStr = 'OUT_OF_STOCK';
            statusBadgeStatus = 'error';
          } else if (product.stock <= product.reorderLevel) {
            statusStr = 'LOW_STOCK';
            statusBadgeStatus = 'warning';
          }
          
          const progressPercentage = Math.min(100, Math.max(0, (product.stock / (product.reorderLevel * 2)) * 100));
          const IconComponent = (Icons as any)[product.iconName] || Icons.Box;

          return (
            <Card key={product.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <IconComponent className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">{product.name}</h3>
                    <p className="text-cyan-500 font-medium">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <StatusBadge status={statusStr} size="sm" />
              </div>
              
              <div className="space-y-4 flex-grow">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Stock: <span className="text-gray-100 font-medium">{product.stock}</span></span>
                    <span>Reorder: {product.reorderLevel}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${statusStr === 'OUT_OF_STOCK' ? 'bg-red-500' : statusStr === 'LOW_STOCK' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Today's Sales:</span>
                  <span className="text-gray-100 font-medium">{product.todaySold} units</span>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => handleEditClick(product)}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-gray-100 py-2 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Stock</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Stock"
      >
        {editingProduct && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                {(() => {
                  const ModalIcon = (Icons as any)[editingProduct.iconName] || Icons.Box;
                  return <ModalIcon className="w-6 h-6 text-cyan-500" />;
                })()}
              </div>
              <span className="text-lg font-medium text-gray-100">{editingProduct.name}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
                min="0"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStock}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
