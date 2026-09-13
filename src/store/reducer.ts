// ============================================================
// CyberPulse — State Reducer
// ============================================================

import type { AppState, AppAction } from './types';
import { createInitialState } from './initialData';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ========================================
    // PROCESS TRANSACTION — the central integration point
    // Creates transaction, deducts stock, starts session, updates PC
    // ========================================
    case 'PROCESS_TRANSACTION': {
      const { transaction, session, soldItems } = action;

      // Update products (deduct sold items, increment todaySold)
      const updatedProducts = state.products.map((product) => {
        const sold = soldItems.find((si) => si.productId === product.id);
        if (!sold) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - sold.quantity),
          todaySold: product.todaySold + sold.quantity,
        };
      });

      // Update PCs (set the PC to IN_USE if session is created)
      const updatedPCs = state.pcs.map((pc) => {
        if (session && pc.id === session.pcId) {
          return {
            ...pc,
            status: 'IN_USE' as const,
            powerState: 'ON' as const,
            currentSessionId: session.id,
            lastActivity: new Date().toISOString(),
          };
        }
        return pc;
      });

      // Add the session if one was created
      const updatedSessions = session
        ? [...state.sessions, session]
        : state.sessions;

      // Update current shift
      const updatedShift = state.currentShift
        ? {
            ...state.currentShift,
            systemSales: state.currentShift.systemSales + transaction.grandTotal,
            expectedCash: state.currentShift.openingCash + state.currentShift.systemSales + transaction.grandTotal,
          }
        : state.currentShift;

      return {
        ...state,
        transactions: [...state.transactions, transaction],
        products: updatedProducts,
        pcs: updatedPCs,
        sessions: updatedSessions,
        currentShift: updatedShift,
        transactionCounter: state.transactionCounter + 1,
      };
    }

    // ========================================
    // END SESSION
    // ========================================
    case 'END_SESSION': {
      const updatedSessions = state.sessions.map((s) =>
        s.id === action.sessionId
          ? { ...s, status: 'COMPLETED' as const, remainingSeconds: 0 }
          : s
      );
      const session = state.sessions.find((s) => s.id === action.sessionId);
      const updatedPCs = state.pcs.map((pc) =>
        pc.id === session?.pcId
          ? { ...pc, status: 'AVAILABLE' as const, currentSessionId: null, lastActivity: new Date().toISOString() }
          : pc
      );
      return { ...state, sessions: updatedSessions, pcs: updatedPCs };
    }

    // ========================================
    // EXTEND SESSION
    // ========================================
    case 'EXTEND_SESSION': {
      const updatedSessions = state.sessions.map((s) => {
        if (s.id !== action.sessionId) return s;
        return {
          ...s,
          durationMinutes: s.durationMinutes + action.minutes,
          remainingSeconds: s.remainingSeconds + action.minutes * 60,
          revenue: s.revenue + action.amount,
          extensions: [
            ...s.extensions,
            { time: new Date().toISOString(), minutes: action.minutes, amount: action.amount },
          ],
        };
      });

      // Also update the transaction's pcCharge and grandTotal
      const session = state.sessions.find((s) => s.id === action.sessionId);
      const updatedTransactions = state.transactions.map((tx) => {
        if (tx.sessionId !== action.sessionId) return tx;
        return {
          ...tx,
          pcCharge: tx.pcCharge + action.amount,
          grandTotal: tx.grandTotal + action.amount,
          sessionDurationMinutes: (tx.sessionDurationMinutes || 0) + action.minutes,
        };
      });

      // Update shift sales
      const updatedShift = state.currentShift
        ? {
            ...state.currentShift,
            systemSales: state.currentShift.systemSales + action.amount,
            expectedCash: state.currentShift.expectedCash + action.amount,
          }
        : state.currentShift;

      return {
        ...state,
        sessions: updatedSessions,
        transactions: updatedTransactions,
        currentShift: updatedShift,
      };
    }

    // ========================================
    // TICK TIMERS — called every second
    // ========================================
    case 'TICK_TIMERS': {
      let hasChanges = false;
      const completedPCIds: string[] = [];

      const updatedSessions = state.sessions.map((s) => {
        if (s.status !== 'ACTIVE') return s;
        if (s.remainingSeconds <= 0) return s;

        hasChanges = true;
        const newRemaining = s.remainingSeconds - 1;

        if (newRemaining <= 0) {
          completedPCIds.push(s.pcId);
          return { ...s, remainingSeconds: 0, status: 'COMPLETED' as const };
        }
        return { ...s, remainingSeconds: newRemaining };
      });

      if (!hasChanges) return state;

      const updatedPCs = state.pcs.map((pc) => {
        if (completedPCIds.includes(pc.id)) {
          return {
            ...pc,
            status: 'AVAILABLE' as const,
            currentSessionId: null,
            lastActivity: new Date().toISOString(),
          };
        }
        return pc;
      });

      return { ...state, sessions: updatedSessions, pcs: updatedPCs };
    }

    // ========================================
    // WAKE PC
    // ========================================
    case 'WAKE_PC': {
      const updatedPCs = state.pcs.map((pc) =>
        pc.id === action.pcId
          ? { ...pc, status: 'AVAILABLE' as const, powerState: 'ON' as const, lastActivity: new Date().toISOString() }
          : pc
      );
      return { ...state, pcs: updatedPCs };
    }

    // ========================================
    // SLEEP PC
    // ========================================
    case 'SLEEP_PC': {
      const updatedPCs = state.pcs.map((pc) =>
        pc.id === action.pcId
          ? { ...pc, status: 'SLEEPING' as const, powerState: 'SLEEP' as const, lastActivity: new Date().toISOString() }
          : pc
      );
      return { ...state, pcs: updatedPCs };
    }

    // ========================================
    // SET PC STATUS
    // ========================================
    case 'SET_PC_STATUS': {
      const updatedPCs = state.pcs.map((pc) =>
        pc.id === action.pcId
          ? { ...pc, status: action.status, powerState: action.powerState ?? pc.powerState, lastActivity: new Date().toISOString() }
          : pc
      );
      return { ...state, pcs: updatedPCs };
    }

    // ========================================
    // VOID TRANSACTION
    // ========================================
    case 'VOID_TRANSACTION': {
      const tx = state.transactions.find((t) => t.id === action.transactionId);
      if (!tx) return state;

      // Restore stock
      const updatedProducts = state.products.map((product) => {
        const item = tx.snackItems.find((si) => si.productId === product.id);
        if (!item) return product;
        return {
          ...product,
          stock: product.stock + item.quantity,
          todaySold: Math.max(0, product.todaySold - item.quantity),
        };
      });

      // Mark transaction as void
      const updatedTransactions = state.transactions.map((t) =>
        t.id === action.transactionId ? { ...t, status: 'VOID' as const } : t
      );

      // Update shift
      const updatedShift = state.currentShift
        ? {
            ...state.currentShift,
            systemSales: state.currentShift.systemSales - tx.grandTotal,
            expectedCash: state.currentShift.expectedCash - tx.grandTotal,
          }
        : state.currentShift;

      return {
        ...state,
        transactions: updatedTransactions,
        products: updatedProducts,
        currentShift: updatedShift,
      };
    }

    // ========================================
    // UPDATE STOCK
    // ========================================
    case 'UPDATE_STOCK': {
      const updatedProducts = state.products.map((p) =>
        p.id === action.productId ? { ...p, stock: action.newStock } : p
      );
      return { ...state, products: updatedProducts };
    }

    // ========================================
    // ADD PRODUCT
    // ========================================
    case 'ADD_PRODUCT': {
      return { ...state, products: [...state.products, action.product] };
    }

    // ========================================
    // START SHIFT
    // ========================================
    case 'START_SHIFT': {
      // Archive current shift if exists
      const shifts = state.currentShift
        ? [...state.shifts, state.currentShift]
        : state.shifts;
      return { ...state, shifts, currentShift: action.shift };
    }

    // ========================================
    // SUBMIT CASH COUNT
    // ========================================
    case 'SUBMIT_CASH_COUNT': {
      if (!state.currentShift) return state;
      const expected = state.currentShift.expectedCash;
      const variance = action.actualCash - expected;
      let status: 'BALANCED' | 'CASH_SHORTAGE' | 'CASH_OVERAGE' = 'BALANCED';
      if (variance < 0) status = 'CASH_SHORTAGE';
      if (variance > 0) status = 'CASH_OVERAGE';

      const closedShift = {
        ...state.currentShift,
        endTime: new Date().toISOString(),
        actualCash: action.actualCash,
        variance,
        status,
      };

      return {
        ...state,
        shifts: [...state.shifts, closedShift],
        currentShift: null,
      };
    }

    // ========================================
    // ADD AUDIT LOG
    // ========================================
    case 'ADD_AUDIT_LOG': {
      if (!state.currentShift) return state;
      return {
        ...state,
        currentShift: {
          ...state.currentShift,
          auditLog: [...state.currentShift.auditLog, action.entry],
        },
      };
    }

    // ========================================
    // UPDATE SETTINGS
    // ========================================
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    }

    // ========================================
    // RESET DATA
    // ========================================
    case 'RESET_DATA': {
      return createInitialState();
    }

    // ========================================
    // LOAD STATE
    // ========================================
    case 'LOAD_STATE': {
      return action.state;
    }

    default:
      return state;
  }
}
