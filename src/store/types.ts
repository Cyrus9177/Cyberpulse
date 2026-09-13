// ============================================================
// CyberPulse — Core Type Definitions
// ============================================================

export type PCStatus = 'AVAILABLE' | 'IN_USE' | 'SLEEPING' | 'OFFLINE';
export type PowerState = 'ON' | 'OFF' | 'SLEEP';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TransactionStatus = 'PAID' | 'VOID';
export type ShiftStatus = 'ACTIVE' | 'CLOSED' | 'BALANCED' | 'CASH_SHORTAGE' | 'CASH_OVERAGE';
export type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface PC {
  id: string;
  name: string;
  status: PCStatus;
  powerState: PowerState;
  currentSessionId: string | null;
  lastActivity: string;
  networkStatus: 'ONLINE' | 'OFFLINE';
  ipAddress: string;
  macAddress: string;
}

export interface SessionExtension {
  time: string;
  minutes: number;
  amount: number;
}

export interface Session {
  id: string;
  pcId: string;
  pcName: string;
  transactionId: string;
  startTime: string;
  durationMinutes: number;
  remainingSeconds: number;
  ratePerHour: number;
  revenue: number;
  status: SessionStatus;
  extensions: SessionExtension[];
}

export interface SnackItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  displayId: string;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  pcId: string | null;
  pcName: string | null;
  sessionId: string | null;
  pcCharge: number;
  snackItems: SnackItem[];
  snackTotal: number;
  grandTotal: number;
  payment: number;
  change: number;
  status: TransactionStatus;
  sessionDurationMinutes: number | null;
}

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'beverage' | 'snack';
  stock: number;
  reorderLevel: number;
  price: number;
  todaySold: number;
  iconName: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime: string | null;
  openingCash: number;
  systemSales: number;
  expectedCash: number;
  actualCash: number | null;
  variance: number | null;
  status: ShiftStatus;
  auditLog: AuditEntry[];
}

export interface DemandForecast {
  datetime: string;
  label: string;
  demand: DemandLevel;
  confidence: number;
  factors: string[];
}

export interface AppState {
  pcs: PC[];
  sessions: Session[];
  transactions: Transaction[];
  products: Product[];
  shifts: Shift[];
  currentShift: Shift | null;
  settings: ShopSettings;
  transactionCounter: number;
}

export interface ShopSettings {
  shopName: string;
  ratePerHour: number;
  currency: string;
}

// ============================================================
// Reducer Actions
// ============================================================

export type AppAction =
  | {
      type: 'PROCESS_TRANSACTION';
      transaction: Transaction;
      session: Session | null;
      soldItems: Array<{ productId: string; quantity: number }>;
    }
  | { type: 'END_SESSION'; sessionId: string }
  | { type: 'EXTEND_SESSION'; sessionId: string; minutes: number; amount: number }
  | { type: 'TICK_TIMERS' }
  | { type: 'WAKE_PC'; pcId: string }
  | { type: 'SLEEP_PC'; pcId: string }
  | { type: 'SET_PC_STATUS'; pcId: string; status: PCStatus; powerState?: PowerState }
  | { type: 'VOID_TRANSACTION'; transactionId: string }
  | { type: 'UPDATE_STOCK'; productId: string; newStock: number }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'START_SHIFT'; shift: Shift }
  | { type: 'SUBMIT_CASH_COUNT'; actualCash: number }
  | { type: 'ADD_AUDIT_LOG'; entry: AuditEntry }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<ShopSettings> }
  | { type: 'RESET_DATA' }
  | { type: 'LOAD_STATE'; state: AppState };
