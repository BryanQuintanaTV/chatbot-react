/**
 * ReadOnlyContext
 *
 * Previously sourced from VITE_READ_ONLY_MODE env variable.
 * Now reads `readOnlyMode` from SystemConfigContext (DB-driven).
 *
 * All consumer components continue to use `useReadOnly()` unchanged.
 */

import { createContext, useContext } from 'react';
import { useSystemConfig } from '@/contexts/SystemConfigContext';

const ReadOnlyContext = createContext({ isReadOnly: false });

export const useReadOnly = () => {
  const context = useContext(ReadOnlyContext);
  if (context === undefined) {
    throw new Error('useReadOnly must be used within a ReadOnlyProvider');
  }
  return context;
};

export function ReadOnlyProvider({ children }) {
  const { readOnlyMode } = useSystemConfig();

  return (
    <ReadOnlyContext.Provider value={{ isReadOnly: readOnlyMode }}>
      {children}
    </ReadOnlyContext.Provider>
  );
}
