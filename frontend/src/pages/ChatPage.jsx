import { useTranslation } from 'react-i18next';
import Chatbot from '@/components/Chatbot';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import logo from '@/assets/images/itch_II_logo.png';
import { Toaster } from "sonner";

export function ChatPage() {
  const { t } = useTranslation();
  const { sidebarState, isMobile } = useSidebar();

  const isCollapsed = sidebarState === 'collapsed';

  return (
    <>
      <Sidebar />
      <div
        className='flex flex-col h-screen w-full transition-all duration-300 overflow-hidden'
        style={{ marginLeft: isMobile ? '0' : (isCollapsed ? '64px' : '256px') }}
      >
        <Toaster richColors position="top-right" />
        <div className='flex flex-col h-full w-full max-w-7xl mx-auto px-4'>
          <header className='shrink-0 z-20 bg-background border-b'>
            <div className='flex flex-col h-full w-full gap-1 pt-4 pb-2'>
              <a href='https://chihuahua2.tecnm.mx/'>
                <img src={logo} className='w-32' alt='logo' />
              </a>
              <h1 className='font-urbanist text-[1.65rem] font-semibold text-foreground'>{t('common.appName')}</h1>
              <p className='font-urbanist text-destructive text-md font-light'>{t('common.testMode')}</p>
            </div>
          </header>
          <Chatbot />
        </div>
      </div>
    </>
  );
}
