import { message } from 'antd';
import type { ToastOptions } from 'react-toastify';

interface ToastConfig extends ToastOptions {
  message: string;
  description?: string;
}

export const useToast = () => {
  const showToast = ({
    message: content,
    type = 'info',
    description,
    ...rest
  }: ToastConfig) => {
    switch (type) {
      case 'success':
        message.success(content);
        break;
      case 'error':
        message.error(content);
        break;
      case 'warning':
        message.warning(content);
        break;
      case 'info':
      default:
        message.info(content);
        break;
    }
  };

  return {
    success: (config: Omit<ToastConfig, 'type'>) => showToast({ ...config, type: 'success' }),
    error: (config: Omit<ToastConfig, 'type'>) => showToast({ ...config, type: 'error' }),
    warning: (config: Omit<ToastConfig, 'type'>) => showToast({ ...config, type: 'warning' }),
    info: (config: Omit<ToastConfig, 'type'>) => showToast({ ...config, type: 'info' }),
  };
}; 