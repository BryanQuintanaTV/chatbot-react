import { createContext, useContext } from 'react';

const ReadOnlyContext = createContext({ isReadOnly: false });

export const useReadOnly = () => {
  const context = useContext(ReadOnlyContext);
  if (context === undefined) {
    throw new Error('useReadOnly must be used within a ReadOnlyProvider');
  }
  return context;
};

export function ReadOnlyProvider({ children, isReadOnly }) {
  return (
    <ReadOnlyContext.Provider value={{ isReadOnly }}>
      {children}
    </ReadOnlyContext.Provider>
  );
}
