import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import IconWrapper, { StatusIcon } from './IconWrapper';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  XCircle,
  Bell,
  BellOff
} from 'lucide-react';

interface NotificationProps {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: (id: string) => void;
  showProgress?: boolean;
  icon?: React.ComponentType<any>;
  className?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    color: 'success',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    iconBg: 'bg-green-100 dark:bg-green-800/50',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-800 dark:text-green-200',
    progressColor: 'bg-green-500'
  },
  warning: {
    icon: AlertTriangle,
    color: 'warning',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800/50',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    progressColor: 'bg-yellow-500'
  },
  error: {
    icon: XCircle,
    color: 'error',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    iconBg: 'bg-red-100 dark:bg-red-800/50',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    progressColor: 'bg-red-500'
  },
  info: {
    icon: Info,
    color: 'info',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-800/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    progressColor: 'bg-blue-500'
  }
};

export default function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
  showProgress = true,
  icon: CustomIcon,
  className
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const config = typeConfig[type];
  const IconComponent = CustomIcon || config.icon;

  useEffect(() => {
    if (duration === 0 || isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          setIsVisible(false);
          onClose?.(id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isPaused, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.(id);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-out',
        'animate-slide-in-right',
        'max-w-sm w-full shadow-lg rounded-lg border',
        config.bg,
        config.border,
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            config.iconBg
          )}>
            <IconComponent className={cn('w-5 h-5', config.iconColor)} />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={cn('text-sm font-semibold', config.textColor)}>
                  {title}
                </h4>
                {message && (
                  <p className={cn('text-sm mt-1', config.textColor, 'opacity-90')}>
                    {message}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className={cn(
                  'ml-4 flex-shrink-0 p-1 rounded-md',
                  'hover:bg-black/10 dark:hover:bg-white/10',
                  'transition-colors duration-200',
                  config.iconColor
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action button */}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-md',
                    'transition-colors duration-200',
                    config.iconBg,
                    config.iconColor,
                    'hover:opacity-80'
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && duration > 0 && (
          <div className="mt-3">
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1">
              <div
                className={cn(
                  'h-1 rounded-full transition-all duration-100 ease-linear',
                  config.progressColor
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification container and hook
interface NotificationContextType {
  notifications: NotificationProps[];
  addNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const NotificationContext = React.createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: (id) => setNotifications(prev => prev.filter(n => n.id !== id))
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Notification
            {...notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};

// Convenience hooks for different notification types
export const useSuccessNotification = () => {
  const { addNotification } = useNotifications();
  
  return (title: string, message?: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  };
};

export const useErrorNotification = () => {
  const { addNotification } = useNotifications();
  
  return (title: string, message?: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // Errors are persistent by default
      ...options
    });
  };
};

export const useWarningNotification = () => {
  const { addNotification } = useNotifications();
  
  return (title: string, message?: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  };
};

export const useInfoNotification = () => {
  const { addNotification } = useNotifications();
  
  return (title: string, message?: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  };
};

// Toast notification component for inline usage
export const Toast: React.FC<{
  type: NotificationProps['type'];
  title: string;
  message?: string;
  show?: boolean;
  onClose?: () => void;
  duration?: number;
  className?: string;
}> = ({ type, title, message, show = true, onClose, duration = 3000, className }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (!isVisible || duration === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={cn('animate-scale-in', className)}>
      <Notification
        id="toast"
        type={type}
        title={title}
        message={message}
        duration={0} // Toast doesn't auto-close
        onClose={() => {
          setIsVisible(false);
          onClose?.();
        }}
      />
    </div>
  );
};

// Alert banner component
export const AlertBanner: React.FC<{
  type: NotificationProps['type'];
  title: string;
  message?: string;
  show?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ type, title, message, show = true, onClose, action, className }) => {
  const config = typeConfig[type];
  
  if (!show) return null;

  return (
    <div className={cn(
      'px-4 py-3 border-l-4',
      config.bg,
      config.border,
      config.textColor,
      'animate-fade-in',
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <StatusIcon status={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'} />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          {message && (
            <p className="text-sm mt-1 opacity-90">{message}</p>
          )}
          {action && (
            <div className="mt-2">
              <button
                onClick={action.onClick}
                className={cn(
                  'text-xs font-medium underline hover:no-underline',
                  config.textColor
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'ml-4 flex-shrink-0 p-1 rounded-md',
              'hover:bg-black/10 dark:hover:bg-white/10',
              config.textColor
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};