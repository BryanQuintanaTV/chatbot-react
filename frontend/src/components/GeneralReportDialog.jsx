import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function GeneralReportDialog({ children }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error(t('report.selectCategory'));
      return;
    }

    if (!title.trim()) {
      toast.error(t('report.enterTitle'));
      return;
    }

    if (!description.trim()) {
      toast.error(t('report.enterDescription'));
      return;
    }

    setIsSubmitting(true);

    const payload = {
      category,
      title: title.trim(),
      description: description.trim(),
      date: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // await api.sendGeneralReport(payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('General report submitted:', payload);

      toast.success(t('report.success'));

      // Reset form
      setCategory('');
      setTitle('');
      setDescription('');
      setOpen(false);
    } catch (err) {
      console.error('Error al enviar el reporte:', err);
      toast.error(t('report.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="category">{t('report.category')}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder={t('report.selectCategoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">{t('report.categories.bug')}</SelectItem>
            <SelectItem value="feature">{t('report.categories.feature')}</SelectItem>
            <SelectItem value="ui">{t('report.categories.ui')}</SelectItem>
            <SelectItem value="performance">{t('report.categories.performance')}</SelectItem>
            <SelectItem value="other">{t('report.categories.other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">{t('report.title')}</Label>
        <Input
          id="title"
          placeholder={t('report.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">{t('report.description')}</Label>
        <Textarea
          id="description"
          placeholder={t('report.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="resize-none"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('report.sending') : t('report.submit')}
      </Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="ghost" className="w-full justify-start">
              {t('report.buttonText')}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('report.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('report.dialogDescription')}</DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children || (
          <Button variant="ghost" className="w-full justify-start">
            {t('report.buttonText')}
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('report.dialogTitle')}</DrawerTitle>
          <DrawerDescription>{t('report.dialogDescription')}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">{form}</div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
