import React, { useState } from "react"
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from "../hooks/useMediaQuery"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import api from "../api";
import { toast } from "sonner";



export default function ReportIssueDialog({ message, userMessage }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!feedback.trim()) {
    toast.error(t('report.errorEmpty'));
    return;
  }

  const payload = {
    message_send: userMessage,
    message_receive: message,
    date: new Date().toISOString(),
    dataset_version: "4.0",
    message_report: feedback
  };

  try {
    await api.sendReport(payload);
    toast.success(t('report.successMessage'));
    setFeedback("");
    setIsSubmitted(true);  // 🔒 deshabilita el botón
    setOpen(false);
  } catch (err) {
    console.error("Error al enviar el reporte:", err);
    toast.error(t('report.errorMessage'));
  }
};

  const form = (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="userMessage">{t('report.userMessageLabel')}</Label>
        <Textarea id="userMessage" value={userMessage || ""} readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">{t('report.assistantMessageLabel')}</Label>
        <Textarea id="message" value={message} readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="feedback">{t('report.feedbackLabel')}</Label>
        <Textarea
          id="feedback"
          placeholder={t('report.feedbackPlaceholder')}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <Button type="submit">{t('report.submitButton')}</Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
        <Button
          disabled={isSubmitted}
          variant={isSubmitted ? "outline" : "destructive"}
          className={isSubmitted ? "bg-green-600 hover:bg-green-600 text-white" : ""}
        >
          {isSubmitted ? t('report.submitted') : t('report.button')}
        </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('report.title')}</DialogTitle>
            <DialogDescription>
              {t('report.description')} <br />
              <small>{t('report.datasetVersion')}</small>
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
      <Button
        disabled={isSubmitted}
        variant={isSubmitted ? "outline" : "destructive"}
        className={isSubmitted ? "bg-green-600 hover:bg-green-600 text-white" : ""}
      >
        {isSubmitted ? t('report.submitted') : t('report.button')}
      </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('report.title')}</DrawerTitle>
          <DrawerDescription>
            {t('report.description')} <br />
            <small>{t('report.datasetVersion')}</small>
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{form}</div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}