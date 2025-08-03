import React, { createContext, useState, useContext } from 'react';
import Toaster from '../components/Toaster';

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toaster message={toast.message} type={toast.type} onHide={hideToast} />}
    </ToastContext.Provider>
  );
};
