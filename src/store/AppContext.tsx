// ============================================================
// CyberPulse — Application Context Provider
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { AppState, AppAction } from './types';
import { appReducer } from './reducer';
import { createInitialState } from './initialData';
import { saveState, loadState } from './localStorage';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, () => {
    const saved = loadState();
    return saved || createInitialState();
  });

  // Save to localStorage on every state change (debounced)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveState(state), 300);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state]);

  // Session timer — tick every second
  useEffect(() => {
    const hasActive = state.sessions.some(
      (s) => s.status === 'ACTIVE' && s.remainingSeconds > 0
    );
    if (!hasActive) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TIMERS' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.sessions.filter((s) => s.status === 'ACTIVE').length]);

  const value = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
