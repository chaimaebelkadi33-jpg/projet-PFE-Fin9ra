import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineXCircle, HiOutlineInformationCircle, HiOutlineXMark } from "react-icons/hi2";
import "../Styles/toast.css";

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4500) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, toast.duration - 400);

    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 400);
  };

  const icons = {
    success: <HiOutlineCheckCircle className="toast-icon" />,
    error: <HiOutlineXCircle className="toast-icon" />,
    warning: <HiOutlineExclamationTriangle className="toast-icon" />,
    info: <HiOutlineInformationCircle className="toast-icon" />,
  };

  return (
    <div className={`toast-item toast-${toast.type} ${isExiting ? "toast-exit" : "toast-enter"}`}>
      <div className="toast-body">
        {icons[toast.type]}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Fermer">
        <HiOutlineXMark />
      </button>
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

export default ToastProvider;
