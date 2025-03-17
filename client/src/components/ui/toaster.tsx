import { useState, useEffect } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// Create a simple toast hook
export function useLocalToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toast: addToast, toasts, removeToast };
}

// Toast component
function LocalToast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { title, description, type = "default" } = toast;

  const bgColor = {
    default: "bg-background",
    success: "bg-green-100 dark:bg-green-900",
    error: "bg-red-100 dark:bg-red-900",
    warning: "bg-yellow-100 dark:bg-yellow-900",
  }[type];

  return (
    <div
      className={`${bgColor} border rounded-md shadow-lg p-4 mb-2 flex justify-between items-start`}
      role="alert"
    >
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm mt-1">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useLocalToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const { removeToast } = useLocalToast();
        return (
          <LocalToast key={id} toast={{ id, title, description, ...props }} onClose={() => removeToast(id)}>
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
