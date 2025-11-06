import Chatbot from '@/components/Chatbot';
import { Sidebar } from '@/components/Sidebar';
import logo from '@/assets/images/itch_II_logo.png';
import { Toaster } from "sonner";

export function ChatPage() {
  return (
    <div className='flex flex-col min-h-full w-full max-w-3xl mx-auto px-4'>
      <Toaster richColors position="top-right" />
      <header className='sticky top-0 shrink-0 z-20 bg-background border-b'>
        <div className='flex flex-col h-full w-full gap-1 pt-4 pb-2'>
          <div className="flex items-center gap-3">
            <Sidebar />
            <a href='https://chihuahua2.tecnm.mx/'>
              <img src={logo} className='w-32' alt='logo' />
            </a>
          </div>
          <h1 className='font-urbanist text-[1.65rem] font-semibold'>Tec Bot</h1>
          <p className='font-urbanist text-destructive text-md font-light'>&lt;Modo De Testeo&gt;</p>
        </div>
      </header>
      <Chatbot />
    </div>
  );
}
