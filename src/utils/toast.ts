import toast, { ToastOptions } from 'react-hot-toast';

const base: ToastOptions = {
  style: {
    background: '#1e293b',
    color: '#fff',
    border: '1px solid #334155'
  },
  duration: 3500
};

export const notifySuccess = (message: string) =>
  toast.success(message, {
    ...base,
    iconTheme: { primary: '#22c55e', secondary: '#1e293b' }
  });

export const notifyError = (message: string) =>
  toast.error(message, {
    ...base,
    iconTheme: { primary: '#ef4444', secondary: '#1e293b' }
  });

export const notifyInfo = (message: string) =>
  toast(message, {
    ...base,
    icon: 'ℹ️'
  });

export const notifyLoading = (message: string) =>
  toast.loading(message, {
    ...base
  }); 