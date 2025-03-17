import { useState, createContext, useContext, ReactNode } from "react";
import {
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";

interface LocalToast {
  id: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
}

interface ToastContextType {
  toasts: LocalToast[];
  addToast: (toast: Omit<LocalToast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider component
export function LocalToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<LocalToast[]>([]);

  const addToast = (toast: Omit<LocalToast, "id">) => {
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

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useLocalToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useLocalToast must be used within a LocalToastProvider");
  }
  return {
    toast: context.addToast,
    toasts: context.toasts,
    removeToast: context.removeToast
  };
}

// Toast component
function LocalToastComponent({ toast, onClose, children }: { toast: LocalToast; onClose: () => void; children?: ReactNode }) {
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
        {children}
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

export function Toaster() {
  const { toasts, removeToast } = useLocalToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, ...props }) => (
        <LocalToastComponent
          key={id}
          toast={{ id, title, description, ...props }}
          onClose={() => removeToast(id)}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
