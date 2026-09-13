// ============================================================
// CyberPulse — Seed / Initial Data
// ============================================================

import type { AppState, PC, Product, Shift, Session, Transaction, AuditEntry } from './types';
import { generateId } from '../utils/ids';

const now = new Date();
const todayStr = now.toISOString().slice(0, 10);
const dayStart = new Date(`${todayStr}T00:00:00`);

function isoAt(hour: number, min: number = 0): string {
  const d = new Date(dayStart);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

// ---- 20 PCs ----
function generatePCs(): PC[] {
  const pcs: PC[] = [];
  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(2, '0');
    let status: PC['status'] = 'AVAILABLE';
    let powerState: PC['powerState'] = 'ON';

    // 8 in use: PCs 1,2,3,5,8,10,12,14
    if ([1, 2, 3, 5, 8, 10, 12, 14].includes(i)) {
      status = 'IN_USE';
      powerState = 'ON';
    }
    // 5 sleeping: PCs 15,16,17,18,19
    else if ([15, 16, 17, 18, 19].includes(i)) {
      status = 'SLEEPING';
      powerState = 'SLEEP';
    }
    // 7 available: PCs 4,6,7,9,11,13,20
    else {
      status = 'AVAILABLE';
      powerState = 'ON';
    }

    pcs.push({
      id: `pc-${num}`,
      name: `PC-${num}`,
      status,
      powerState,
      currentSessionId: null, // Will be set after sessions are created
      lastActivity: isoAt(8 + (i % 3), i * 3),
      networkStatus: 'ONLINE',
      ipAddress: `192.168.1.${100 + i}`,
      macAddress: `AA:BB:CC:DD:${num}:${num}`,
    });
  }
  return pcs;
}

// ---- 7 Products ----
function generateProducts(): Product[] {
  return [
    { id: 'prod-burger', name: 'Burger', category: 'food', stock: 8, reorderLevel: 10, price: 80, todaySold: 7, iconName: 'Sandwich' },
    { id: 'prod-iced-tea', name: 'Iced Tea', category: 'beverage', stock: 15, reorderLevel: 10, price: 35, todaySold: 12, iconName: 'GlassWater' },
    { id: 'prod-noodles', name: 'Instant Noodles', category: 'food', stock: 22, reorderLevel: 15, price: 25, todaySold: 5, iconName: 'Soup' },
    { id: 'prod-coffee', name: 'Coffee', category: 'beverage', stock: 18, reorderLevel: 10, price: 40, todaySold: 8, iconName: 'Coffee' },
    { id: 'prod-chips', name: 'Chips', category: 'snack', stock: 30, reorderLevel: 15, price: 20, todaySold: 10, iconName: 'PackageOpen' },
    { id: 'prod-softdrink', name: 'Soft Drink', category: 'beverage', stock: 12, reorderLevel: 10, price: 30, todaySold: 9, iconName: 'CupSoda' },
    { id: 'prod-water', name: 'Water', category: 'beverage', stock: 40, reorderLevel: 20, price: 15, todaySold: 6, iconName: 'Droplet' },
  ];
}

// ---- Sample Sessions (for the 8 in-use PCs) ----
function generateSessions(): Session[] {
  const inUsePCs = [1, 2, 3, 5, 8, 10, 12, 14];
  const durations = [120, 60, 90, 60, 120, 60, 180, 90]; // minutes
  const startOffsets = [40, 20, 55, 15, 70, 25, 100, 45]; // minutes ago
  const sessions: Session[] = [];

  inUsePCs.forEach((pcNum, idx) => {
    const num = String(pcNum).padStart(2, '0');
    const startMinutesAgo = startOffsets[idx];
    const duration = durations[idx];
    const elapsed = startMinutesAgo * 60;
    const remaining = Math.max(0, duration * 60 - elapsed);
    const revenue = (duration / 60) * 20;

    sessions.push({
      id: `session-${1040 + idx}`,
      pcId: `pc-${num}`,
      pcName: `PC-${num}`,
      transactionId: `tx-init-${idx}`,
      startTime: new Date(now.getTime() - startMinutesAgo * 60000).toISOString(),
      durationMinutes: duration,
      remainingSeconds: remaining,
      ratePerHour: 20,
      revenue,
      status: 'ACTIVE',
      extensions: [],
    });
  });

  return sessions;
}

// ---- Sample Transactions ----
function generateTransactions(): Transaction[] {
  const txs: Transaction[] = [];

  // Earlier completed transactions
  const sampleTxs = [
    { id: 'tx-old-1', displayId: 'TX-00118', time: isoAt(8, 15), pc: 'pc-04', pcName: 'PC-04', pcCharge: 40, snacks: [{ productId: 'prod-coffee', name: 'Coffee', quantity: 1, price: 40, subtotal: 40 }], payment: 100, dur: 120 },
    { id: 'tx-old-2', displayId: 'TX-00119', time: isoAt(8, 30), pc: 'pc-06', pcName: 'PC-06', pcCharge: 20, snacks: [{ productId: 'prod-noodles', name: 'Instant Noodles', quantity: 1, price: 25, subtotal: 25 }], payment: 50, dur: 60 },
    { id: 'tx-old-3', displayId: 'TX-00120', time: isoAt(9, 0), pc: 'pc-09', pcName: 'PC-09', pcCharge: 60, snacks: [], payment: 60, dur: 180 },
    { id: 'tx-old-4', displayId: 'TX-00121', time: isoAt(9, 15), pc: null, pcName: null, pcCharge: 0, snacks: [{ productId: 'prod-burger', name: 'Burger', quantity: 2, price: 80, subtotal: 160 }, { productId: 'prod-softdrink', name: 'Soft Drink', quantity: 2, price: 30, subtotal: 60 }], payment: 250, dur: null },
    { id: 'tx-old-5', displayId: 'TX-00122', time: isoAt(9, 45), pc: 'pc-11', pcName: 'PC-11', pcCharge: 40, snacks: [{ productId: 'prod-iced-tea', name: 'Iced Tea', quantity: 1, price: 35, subtotal: 35 }], payment: 100, dur: 120 },
    { id: 'tx-old-6', displayId: 'TX-00123', time: isoAt(10, 0), pc: 'pc-13', pcName: 'PC-13', pcCharge: 20, snacks: [{ productId: 'prod-chips', name: 'Chips', quantity: 2, price: 20, subtotal: 40 }], payment: 100, dur: 60 },
  ];

  for (const stx of sampleTxs) {
    const snackTotal = stx.snacks.reduce((sum, s) => sum + s.subtotal, 0);
    const grandTotal = stx.pcCharge + snackTotal;
    txs.push({
      id: stx.id,
      displayId: stx.displayId,
      timestamp: stx.time,
      cashierId: 'cashier-john',
      cashierName: 'John',
      pcId: stx.pc,
      pcName: stx.pcName,
      sessionId: stx.pc ? `session-old-${stx.id}` : null,
      pcCharge: stx.pcCharge,
      snackItems: stx.snacks,
      snackTotal,
      grandTotal,
      payment: stx.payment,
      change: stx.payment - grandTotal,
      status: 'PAID',
      sessionDurationMinutes: stx.dur,
    });
  }

  // Current in-use session transactions
  const inUsePCs = [1, 2, 3, 5, 8, 10, 12, 14];
  const durations = [120, 60, 90, 60, 120, 60, 180, 90];
  inUsePCs.forEach((pcNum, idx) => {
    const num = String(pcNum).padStart(2, '0');
    const revenue = (durations[idx] / 60) * 20;
    txs.push({
      id: `tx-init-${idx}`,
      displayId: `TX-${String(124 + idx).padStart(5, '0')}`,
      timestamp: new Date(now.getTime() - [40, 20, 55, 15, 70, 25, 100, 45][idx] * 60000).toISOString(),
      cashierId: 'cashier-john',
      cashierName: 'John',
      pcId: `pc-${num}`,
      pcName: `PC-${num}`,
      sessionId: `session-${1040 + idx}`,
      pcCharge: revenue,
      snackItems: [],
      snackTotal: 0,
      grandTotal: revenue,
      payment: revenue,
      change: 0,
      status: 'PAID',
      sessionDurationMinutes: durations[idx],
    });
  });

  return txs;
}

// ---- Current Shift ----
function generateCurrentShift(transactions: Transaction[]): Shift {
  const systemSales = transactions.reduce((sum, tx) => sum + tx.grandTotal, 0);
  const auditLog: AuditEntry[] = [
    { id: generateId(), timestamp: isoAt(8, 0), action: 'Shift Started', details: 'John started shift with ₱2,000 opening cash' },
    { id: generateId(), timestamp: isoAt(8, 15), action: 'Transaction', details: 'TX-00118 — PC-04 session + coffee — ₱80' },
    { id: generateId(), timestamp: isoAt(8, 30), action: 'Transaction', details: 'TX-00119 — PC-06 session + noodles — ₱45' },
    { id: generateId(), timestamp: isoAt(9, 0), action: 'Transaction', details: 'TX-00120 — PC-09 3hr session — ₱60' },
    { id: generateId(), timestamp: isoAt(9, 15), action: 'Transaction', details: 'TX-00121 — Snack sale (2 burgers + 2 drinks) — ₱220' },
    { id: generateId(), timestamp: isoAt(9, 45), action: 'Transaction', details: 'TX-00122 — PC-11 session + iced tea — ₱75' },
    { id: generateId(), timestamp: isoAt(10, 0), action: 'Transaction', details: 'TX-00123 — PC-13 session + chips — ₱60' },
    { id: generateId(), timestamp: isoAt(10, 5), action: 'Session Started', details: 'PC-01 — 2hr session' },
    { id: generateId(), timestamp: isoAt(10, 10), action: 'Session Started', details: 'PC-02 — 1hr session' },
    { id: generateId(), timestamp: isoAt(10, 15), action: 'Session Started', details: 'PC-03 — 1.5hr session' },
  ];

  return {
    id: 'shift-current',
    cashierId: 'cashier-john',
    cashierName: 'John',
    startTime: isoAt(8, 0),
    endTime: null,
    openingCash: 2000,
    systemSales,
    expectedCash: 2000 + systemSales,
    actualCash: null,
    variance: null,
    status: 'ACTIVE',
    auditLog,
  };
}

// ---- Past Shifts for history ----
function generatePastShifts(): Shift[] {
  const yesterday = new Date(dayStart.getTime() - 86400000);
  const yStr = yesterday.toISOString().slice(0, 10);

  return [
    {
      id: 'shift-past-1',
      cashierId: 'cashier-maria',
      cashierName: 'Maria',
      startTime: `${yStr}T00:00:00.000Z`,
      endTime: `${yStr}T08:00:00.000Z`,
      openingCash: 2000,
      systemSales: 5680,
      expectedCash: 7680,
      actualCash: 7680,
      variance: 0,
      status: 'BALANCED',
      auditLog: [
        { id: generateId(), timestamp: `${yStr}T00:00:00.000Z`, action: 'Shift Started', details: 'Maria started shift' },
        { id: generateId(), timestamp: `${yStr}T08:00:00.000Z`, action: 'Shift Closed', details: 'Cash count: ₱7,680 — BALANCED' },
      ],
    },
    {
      id: 'shift-past-2',
      cashierId: 'cashier-john',
      cashierName: 'John',
      startTime: `${yStr}T08:00:00.000Z`,
      endTime: `${yStr}T16:00:00.000Z`,
      openingCash: 2000,
      systemSales: 9250,
      expectedCash: 11250,
      actualCash: 11000,
      variance: -250,
      status: 'CASH_SHORTAGE',
      auditLog: [
        { id: generateId(), timestamp: `${yStr}T08:00:00.000Z`, action: 'Shift Started', details: 'John started shift' },
        { id: generateId(), timestamp: `${yStr}T16:00:00.000Z`, action: 'Shift Closed', details: 'Cash count: ₱11,000 — SHORTAGE of ₱250' },
      ],
    },
  ];
}

// ---- Build full initial state ----
export function createInitialState(): AppState {
  const products = generateProducts();
  const sessions = generateSessions();
  const transactions = generateTransactions();
  const currentShift = generateCurrentShift(transactions);
  const pastShifts = generatePastShifts();

  // Link PCs to their sessions
  const pcs = generatePCs();
  for (const session of sessions) {
    const pc = pcs.find((p) => p.id === session.pcId);
    if (pc) {
      pc.currentSessionId = session.id;
    }
  }

  return {
    pcs,
    sessions,
    transactions,
    products,
    shifts: [...pastShifts],
    currentShift,
    settings: {
      shopName: 'CyberPulse Gaming Hub',
      ratePerHour: 20,
      currency: '₱',
    },
    transactionCounter: 132, // Next TX will be TX-00132
  };
}

// ---- Mock historical data for analytics charts ----
export function generateHourlyRevenue(): Array<{ hour: string; revenue: number; pcRevenue: number; snackRevenue: number }> {
  const data = [];
  for (let h = 6; h <= 23; h++) {
    const label = h <= 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    const base = h >= 14 && h <= 20 ? 800 : h >= 10 ? 400 : 150;
    const pcRev = Math.round(base * (0.65 + Math.random() * 0.15));
    const snackRev = Math.round(base * (0.2 + Math.random() * 0.1));
    data.push({
      hour: label.replace(' AM', 'AM').replace(' PM', 'PM'),
      revenue: pcRev + snackRev,
      pcRevenue: pcRev,
      snackRevenue: snackRev,
    });
  }
  return data;
}

export function generatePCUtilization(): Array<{ pc: string; utilization: number }> {
  const data = [];
  for (let i = 1; i <= 20; i++) {
    data.push({
      pc: `PC-${String(i).padStart(2, '0')}`,
      utilization: Math.round(30 + Math.random() * 65),
    });
  }
  return data;
}

export function generatePeakHours(): Array<{ hour: string; demand: number }> {
  return [
    { hour: '8 AM', demand: 15 },
    { hour: '10 AM', demand: 25 },
    { hour: '12 PM', demand: 45 },
    { hour: '2 PM', demand: 70 },
    { hour: '4 PM', demand: 90 },
    { hour: '6 PM', demand: 95 },
    { hour: '8 PM', demand: 85 },
    { hour: '10 PM', demand: 40 },
  ];
}

export function generateSnackSalesData(): Array<{ name: string; sold: number; revenue: number }> {
  return [
    { name: 'Iced Tea', sold: 42, revenue: 1470 },
    { name: 'Burger', sold: 28, revenue: 2240 },
    { name: 'Coffee', sold: 35, revenue: 1400 },
    { name: 'Chips', sold: 55, revenue: 1100 },
    { name: 'Soft Drink', sold: 38, revenue: 1140 },
    { name: 'Noodles', sold: 22, revenue: 550 },
    { name: 'Water', sold: 30, revenue: 450 },
  ];
}
