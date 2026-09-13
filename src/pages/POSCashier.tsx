import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Monitor, Coffee, ShoppingCart, Clock, CheckCircle, Plus, Minus, Receipt } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../utils/format';
import { generateId, generateTransactionId } from '../utils/ids';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { PC, Product, Transaction, Session, AuditEntry, SnackItem } from '../store/types';

export default function POSCashier() {
  const { state, dispatch } = useAppContext();
  
  // Form State
  const [selectedPcId, setSelectedPcId] = useState<string | 'SNACK_ONLY' | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<string>('');
  
  // { productId: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});
  
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Derived state
  const availablePCs = state.pcs.filter(pc => pc.status === 'AVAILABLE');
  const ratePerHour = state.settings.ratePerHour;
  
  const pcCharge = useMemo(() => {
    if (selectedPcId === 'SNACK_ONLY' || !selectedPcId) return 0;
    return (durationMinutes / 60) * ratePerHour;
  }, [selectedPcId, durationMinutes, ratePerHour]);

  const cartItems: SnackItem[] = useMemo(() => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = state.products.find(p => p.id === productId)!;
      return {
        productId,
        name: product.name,
        quantity,
        price: product.price,
        subtotal: quantity * product.price
      };
    });
  }, [cart, state.products]);

  const snackTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cartItems]);

  const grandTotal = pcCharge + snackTotal;
  const payment = parseFloat(paymentAmount) || 0;
  const change = payment - grandTotal;
  const isValidPayment = payment >= grandTotal && grandTotal > 0;
  
  const canProceedToPayment = (selectedPcId === 'SNACK_ONLY' && snackTotal > 0) || 
                              (selectedPcId !== 'SNACK_ONLY' && selectedPcId !== null && durationMinutes > 0);

  // Handlers
  const handleAddToCart = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      if (currentQty >= product.stock) return prev;
      return { ...prev, [productId]: currentQty + 1 };
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      if (currentQty <= 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return { ...prev, [productId]: currentQty - 1 };
    });
  };

  const handleDurationSelect = (mins: number) => {
    setDurationMinutes(mins);
    setCustomDuration('');
  };
  
  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDuration(val);
    const mins = parseInt(val, 10);
    if (!isNaN(mins) && mins > 0) {
      setDurationMinutes(mins);
    } else {
      setDurationMinutes(0);
    }
  };

  const resetForm = () => {
    setSelectedPcId(null);
    setDurationMinutes(0);
    setCustomDuration('');
    setCart({});
    setPaymentAmount('');
  };

  const handleConfirm = () => {
    if (!isValidPayment) return;
    
    const cashierId = state.currentShift?.cashierId ?? 'admin';
    const cashierName = state.currentShift?.cashierName ?? 'Admin';
    const txId = generateId();
    const displayId = generateTransactionId(state.transactionCounter);
    const timestamp = new Date().toISOString();
    
    let session: Session | null = null;
    let pcName: string | null = null;
    
    if (selectedPcId !== 'SNACK_ONLY' && selectedPcId) {
      const pc = state.pcs.find(p => p.id === selectedPcId);
      if (pc) {
        pcName = pc.name;
        session = {
          id: generateId(),
          pcId: pc.id,
          pcName: pc.name,
          transactionId: txId,
          startTime: timestamp,
          durationMinutes,
          remainingSeconds: durationMinutes * 60,
          ratePerHour,
          revenue: pcCharge,
          status: 'ACTIVE',
          extensions: []
        };
      }
    }
    
    const transaction: Transaction = {
      id: txId,
      displayId,
      timestamp,
      cashierId,
      cashierName,
      pcId: selectedPcId !== 'SNACK_ONLY' ? selectedPcId : null,
      pcName,
      sessionId: session?.id ?? null,
      pcCharge,
      snackItems: cartItems,
      snackTotal,
      grandTotal,
      payment,
      change,
      status: 'PAID',
      sessionDurationMinutes: selectedPcId !== 'SNACK_ONLY' ? durationMinutes : null
    };
    
    const soldItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    dispatch({
      type: 'PROCESS_TRANSACTION',
      transaction,
      session,
      soldItems
    });
    
    const auditEntry: AuditEntry = {
      id: generateId(),
      timestamp,
      action: 'PROCESS_TRANSACTION',
      details: `Processed transaction ${displayId} for ${formatCurrency(grandTotal)}`
    };
    
    dispatch({
      type: 'ADD_AUDIT_LOG',
      entry: auditEntry
    });
    
    setCompletedTx(transaction);
    setShowSuccessModal(true);
    resetForm();
  };

  const StepHeader = ({ number, title }: { number: number, title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30">
        {number}
      </div>
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-slate-100">Point of Sale</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Steps 1-3 */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* STEP 1 */}
          <Card className="p-6 border-slate-700/50 bg-slate-800/50 backdrop-blur">
            <StepHeader number={1} title="Select PC" />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedPcId('SNACK_ONLY')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedPcId === 'SNACK_ONLY' 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 text-slate-300'
                }`}
              >
                <Coffee className="w-8 h-8 mb-1" />
                <span className="font-medium">Snack Only</span>
              </button>
              
              {availablePCs.map(pc => (
                <button
                  key={pc.id}
                  onClick={() => setSelectedPcId(pc.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedPcId === pc.id 
                    ? 'bg-cyan-500/20 border-cyan-500' 
                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Monitor className={`w-8 h-8 mb-1 ${selectedPcId === pc.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className={`font-medium ${selectedPcId === pc.id ? 'text-cyan-100' : 'text-slate-300'}`}>{pc.name}</span>
                  <StatusBadge status={pc.status} size="sm" />
                </button>
              ))}
              
              {availablePCs.length === 0 && (
                <div className="col-span-full py-4 text-center text-slate-400 italic">
                  No PCs currently available.
                </div>
              )}
            </div>
          </Card>

          {/* STEP 2 */}
          {selectedPcId && selectedPcId !== 'SNACK_ONLY' && (
            <Card className="p-6 border-slate-700/50 bg-slate-800/50 backdrop-blur">
              <StepHeader number={2} title="Select Duration" />
              <div className="flex items-center gap-4 text-slate-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>Rate: {formatCurrency(ratePerHour)} / hour</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {[30, 60, 120, 180].map(mins => (
                  <button
                    key={mins}
                    onClick={() => handleDurationSelect(mins)}
                    className={`px-5 py-3 rounded-lg border font-medium transition-all ${
                      durationMinutes === mins && !customDuration
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60} Hour${mins > 60 ? 's' : ''}` : `${mins} Mins`}
                  </button>
                ))}
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Custom (mins)"
                    value={customDuration}
                    onChange={handleCustomDurationChange}
                    min="1"
                    className="w-32 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3 */}
          <Card className="p-6 border-slate-700/50 bg-slate-800/50 backdrop-blur">
            <StepHeader number={selectedPcId === 'SNACK_ONLY' ? 2 : 3} title="Add Snacks & Drinks" />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {state.products.map(product => {
                const qty = cart[product.id] || 0;
                const isOutOfStock = product.stock <= 0;
                const IconComponent = (Icons as any)[product.iconName] || Icons.Box;
                
                return (
                  <div key={product.id} className={`p-4 rounded-xl border flex flex-col items-center gap-3 ${
                    isOutOfStock ? 'bg-slate-800/80 border-slate-700 opacity-60' : 'bg-slate-700/40 border-slate-600'
                  }`}>
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700/50">
                      <IconComponent className={`w-8 h-8 ${isOutOfStock ? 'text-slate-500' : 'text-cyan-400'}`} />
                    </div>
                    <div className="text-center w-full">
                      <div className="font-medium text-slate-200 truncate" title={product.name}>{product.name}</div>
                      <div className="text-cyan-400 font-semibold">{formatCurrency(product.price)}</div>
                      <div className="text-xs text-slate-400 mt-1">Stock: {product.stock}</div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => handleRemoveFromCart(product.id)}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 disabled:opacity-50 flex items-center justify-center text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-200">{qty}</span>
                      <button 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={qty >= product.stock || isOutOfStock}
                        className="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 flex items-center justify-center text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Step 4 & 5 */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-700 bg-slate-900/80 sticky top-6">
            <StepHeader number={selectedPcId === 'SNACK_ONLY' ? 3 : 4} title="Order Summary" />
            
            <div className="space-y-4 mb-6">
              {selectedPcId && selectedPcId !== 'SNACK_ONLY' && durationMinutes > 0 && (
                <div className="flex justify-between items-start pb-3 border-b border-slate-700/50">
                  <div>
                    <div className="font-medium text-slate-200">
                      PC Session ({state.pcs.find(p => p.id === selectedPcId)?.name})
                    </div>
                    <div className="text-sm text-slate-400">
                      {durationMinutes} minutes
                    </div>
                  </div>
                  <div className="font-semibold text-slate-200">{formatCurrency(pcCharge)}</div>
                </div>
              )}
              
              {cartItems.length > 0 && (
                <div className="space-y-2 pb-3 border-b border-slate-700/50">
                  {cartItems.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {item.name} <span className="text-slate-500">× {item.quantity}</span>
                      </span>
                      <span className="text-slate-200">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-200">Total</span>
                <span className="text-2xl font-bold text-cyan-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={!canProceedToPayment}
                    className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 text-lg font-medium focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>
              </div>
              
              {paymentAmount && !isNaN(payment) && (
                <div className={`flex justify-between p-3 rounded-lg ${change < 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800'}`}>
                  <span className={change < 0 ? 'text-red-400 font-medium' : 'text-slate-400 font-medium'}>
                    {change < 0 ? 'Short by' : 'Change'}
                  </span>
                  <span className={`font-bold ${change < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.abs(change))}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleConfirm}
                disabled={!isValidPayment}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  isValidPayment
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                CONFIRM PAYMENT
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Transaction Successful"
      >
        {completedTx && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-emerald-400">Payment Completed</h3>
              <p className="text-slate-300 mt-1">Transaction {completedTx.displayId}</p>
            </div>
            
            <div className="space-y-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cashier</span>
                <span className="text-slate-200 font-medium">{completedTx.cashierName}</span>
              </div>
              
              {completedTx.pcName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">PC Session</span>
                  <span className="text-slate-200 font-medium">{completedTx.pcName} ({completedTx.sessionDurationMinutes} mins)</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Paid</span>
                <span className="text-slate-200 font-medium">{formatCurrency(completedTx.grandTotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm border-t border-slate-700 pt-3 mt-3">
                <span className="text-slate-400">Change Due</span>
                <span className="text-emerald-400 font-bold text-lg">{formatCurrency(completedTx.change)}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Start New Transaction
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
