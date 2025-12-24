import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  // Sidebar state: 'collapsed' (icons only - 64px), 'expanded' (full - 256px)
  const [sidebarState, setSidebarState] = useState('collapsed');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    // Toggle between collapsed and expanded
    setSidebarState(prev => prev === 'collapsed' ? 'expanded' : 'collapsed');
  };

  const closeSidebar = () => {
    // Always go to collapsed state
    setSidebarState('collapsed');
  };

  const value = {
    sidebarState,
    setSidebarState,
    toggleSidebar,
    closeSidebar,
    isMobile,
    // Keep for backward compatibility
    collapsed: sidebarState === 'collapsed',
    toggleCollapsed: toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
