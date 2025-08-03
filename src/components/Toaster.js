
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const toastTypes = {
  success: {
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    style: 'bg-green-100 border-green-500 text-green-700',
  },
  error: {
    icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
    style: 'bg-red-100 border-red-500 text-red-700',
  },
  info: {
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    style: 'bg-blue-100 border-blue-500 text-blue-700',
  },
};

const Toaster = ({ message, type, onHide }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onHide) {
          onHide();
        }
      }, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, onHide]);

  if (!visible || !message) return null;

  const { icon, style } = toastTypes[type] || toastTypes.info;

  return (
    <div className={`fixed top-5 right-5 max-w-sm w-full p-4 rounded-lg shadow-lg border-l-4 ${style} flex items-center space-x-4 transition-transform transform-gpu animate-slide-in-right`}>
      <div>{icon}</div>
      <p className="flex-grow">{message}</p>
      <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-gray-800">
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toaster;
