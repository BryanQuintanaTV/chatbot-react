import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  // Sidebar state: 'hidden', 'collapsed' (icons only), 'expanded' (full)
  const [sidebarState, setSidebarState] = useState('collapsed');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // On mobile, start hidden
      if (mobile && sidebarState === 'collapsed') {
        setSidebarState('hidden');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarState]);

  const toggleSidebar = () => {
    if (isMobile) {
      // Mobile: toggle between hidden and expanded
      setSidebarState(prev => prev === 'hidden' ? 'expanded' : 'hidden');
    } else {
      // Desktop: cycle through hidden -> collapsed -> expanded -> hidden
      setSidebarState(prev => {
        if (prev === 'hidden') return 'collapsed';
        if (prev === 'collapsed') return 'expanded';
        return 'hidden';
      });
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarState('hidden');
    } else {
      // On desktop, go to collapsed state
      setSidebarState('collapsed');
    }
  };

  const value = {
    sidebarState,
    setSidebarState,
    toggleSidebar,
    closeSidebar,
    isMobile,
    // Keep for backward compatibility
    collapsed: sidebarState === 'hidden' || sidebarState === 'collapsed',
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
