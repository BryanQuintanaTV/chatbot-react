import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn, Sparkles, MessageSquare, Save, Zap } from 'lucide-react';

export function WelcomeModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRegister = () => {
    sessionStorage.setItem('welcome-modal-dismissed', 'true');
    onOpenChange(false);
    navigate('/register');
  };

  const handleLogin = () => {
    sessionStorage.setItem('welcome-modal-dismissed', 'true');
    onOpenChange(false);
    navigate('/login');
  };

  const handleContinue = () => {
    sessionStorage.setItem('welcome-modal-dismissed', 'true');
    console.log('Continue clicked - saved to sessionStorage');
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen) => {
    console.log('Dialog onOpenChange called with:', newOpen);
    if (!newOpen) {
      // Modal is being closed (X button, ESC, or backdrop click)
      sessionStorage.setItem('welcome-modal-dismissed', 'true');
      console.log('Modal closed - saved to sessionStorage');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            {t('welcome.title')}
          </DialogTitle>
          <DialogDescription className="pt-4">
            {t('welcome.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{t('welcome.benefits.smartModel.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('welcome.benefits.smartModel.description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{t('welcome.benefits.unlimitedChats.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('welcome.benefits.unlimitedChats.description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Save className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{t('welcome.benefits.saveHistory.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('welcome.benefits.saveHistory.description')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleRegister} className="w-full" size="lg">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('welcome.createAccount')}
          </Button>
          <Button onClick={handleLogin} variant="outline" className="w-full" size="lg">
            <LogIn className="h-4 w-4 mr-2" />
            {t('welcome.login')}
          </Button>
          <Button
            onClick={handleContinue}
            variant="ghost"
            className="w-full mt-2"
            size="sm"
          >
            {t('welcome.continueWithout')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
