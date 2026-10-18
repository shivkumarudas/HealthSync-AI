"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Global toast store
let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export function toast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => removeToast(id), 4000);
}
function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l(toasts));
}

const ICONS = {
  success: <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
  error:   <XCircle    size={18} className="text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />,
  info:    <Info       size={18} className="text-blue-400 flex-shrink-0" />,
};
const COLORS = {
  success: "bg-green-950/90 border-green-800",
  error:   "bg-red-950/90 border-red-800",
  warning: "bg-yellow-950/90 border-yellow-800",
  info:    "bg-blue-950/90 border-blue-800",
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => { listeners = listeners.filter((l) => l !== setItems); };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm pointer-events-auto",
              COLORS[t.type]
            )}
          >
            {ICONS[t.type]}
            <p className="text-sm text-gray-100 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white ml-1 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
