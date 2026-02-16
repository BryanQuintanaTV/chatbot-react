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
} from "./ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import api from "../api";
import { notify } from '@/lib/notify';

/**
 * ReportIssueDialog — controlled dialog for reporting a problem with a message.
 *
 * Props:
 *   open        - Whether the dialog is open (controlled)
 *   onOpenChange - Callback when open state changes
 *   message     - The assistant's response text
 *   userMessage - The user's original message
 *   onSubmitted - Optional callback after successful submission
 */
export default function ReportIssueDialog({
  open,
  onOpenChange,
  message,
  userMessage,
  onSubmitted,
}) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      notify.error({ title: t('report.errorEmpty') });
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
      notify.success({ title: t('report.successMessage') });
      setFeedback("");
      onOpenChange(false);
      onSubmitted?.();
    } catch (err) {
      console.error("Error al enviar el reporte:", err);
      notify.error({ title: t('report.errorMessage') });
    }
  };

  const form = (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="report-userMessage">{t('report.userMessageLabel')}</Label>
        <Textarea id="report-userMessage" value={userMessage || ""} readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="report-message">{t('report.assistantMessageLabel')}</Label>
        <Textarea id="report-message" value={message || ""} readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="report-feedback">{t('report.feedbackLabel')}</Label>
        <Textarea
          id="report-feedback"
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
      <Dialog open={open} onOpenChange={onOpenChange}>
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
    <Drawer open={open} onOpenChange={onOpenChange}>
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
