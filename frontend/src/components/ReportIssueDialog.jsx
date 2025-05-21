import React, { useState } from "react"
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
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!feedback.trim()) {
    toast.error("Por favor escribe el problema antes de enviar.");
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
    toast.success("Reporte enviado correctamente");
    setFeedback("");
    setIsSubmitted(true);  // 🔒 deshabilita el botón
    setOpen(false);
  } catch (err) {
    console.error("Error al enviar el reporte:", err);
    toast.error("Error al enviar el reporte");
  }
};

  const form = (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="userMessage">Mensaje enviado por el usuario</Label>
        <Textarea id="userMessage" value={userMessage || ""} readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Respuesta del asistente</Label>
        <Textarea id="message" value={message} readOnly />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="feedback">¿Qué salió mal?</Label>
        <Textarea
          id="feedback"
          placeholder="Describe el problema..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <Button type="submit">Enviar Reporte</Button>
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
          {isSubmitted ? "Reporte enviado" : "Reportar Problema"}
        </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar Problema</DialogTitle>
            <DialogDescription>
              Describe qué salió mal con esta respuesta. <br />
              <small>Dataset v4.0</small>
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
        {isSubmitted ? "Reporte enviado" : "Reportar Problema"}
      </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Reportar Problema</DrawerTitle>
          <DrawerDescription>
            Describe qué salió mal con esta respuesta. <br />
            <small>Dataset v4.0</small>
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{form}</div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}