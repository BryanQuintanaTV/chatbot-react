import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  // Sidebar state: 'collapsed' (icons only - 64px), 'expanded' (full - 256px)
  // Desktop starts expanded, mobile starts collapsed
  const [sidebarState, setSidebarState] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'expanded' : 'collapsed';
    }
    return 'collapsed';
  });

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // When switching to mobile, collapse sidebar
      if (mobile) {
        setSidebarState('collapsed');
      }
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
    // On mobile: always collapse. On desktop: keep expanded (noop for navigation actions).
    if (isMobile) {
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
