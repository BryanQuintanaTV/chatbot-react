import { useTranslation } from 'react-i18next';
import Chatbot from '@/components/Chatbot';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import logo from '@/assets/images/itch_II_logo.png';
import { Toaster } from "sonner";

export function ChatPage() {
  const { t } = useTranslation();
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <Sidebar />
      <div
        className='flex flex-col h-screen w-full transition-all duration-300 overflow-hidden'
      >
        <Toaster richColors position="top-right" />
        <div className='flex flex-col h-full w-full max-w-5xl mx-auto px-4'>
          <header className='shrink-0 z-20 bg-background border-b'>
            <div className='flex flex-col h-full w-full gap-1 pt-4 pb-2'>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-muted rounded-md"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <a href='https://chihuahua2.tecnm.mx/'>
                  <img src={logo} className='w-32' alt='logo' />
                </a>
              </div>
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
