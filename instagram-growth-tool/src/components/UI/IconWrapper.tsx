import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  LucideIcon, 
  Activity, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Calendar, 
  Search, 
  Sparkles, 
  UserCheck, 
  User, 
  Settings, 
  Instagram, 
  Heart, 
  MessageCircle, 
  Eye, 
  Share, 
  Download,
  Upload,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Globe,
  Building,
  Phone,
  Mail,
  Link,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Camera,
  Image,
  Video,
  FileText,
  Archive,
  Folder,
  Star,
  Bookmark,
  Flag,
  MapPin,
  Tag,
  Hash,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Store,
  Coffee,
  Home,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  Footprints,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Umbrella,
  MousePointer
} from 'lucide-react';

interface IconWrapperProps {
  icon?: LucideIcon | ReactNode;
  children?: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'white' | 'muted';
  variant?: 'default' | 'filled' | 'outline' | 'ghost' | 'soft';
  shape?: 'square' | 'rounded' | 'circle';
  animated?: boolean;
  glow?: boolean;
  pulse?: boolean;
  tooltip?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-secondary-600 dark:text-secondary-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  neutral: 'text-gray-600 dark:text-gray-400',
  white: 'text-white',
  muted: 'text-gray-400 dark:text-gray-500'
};

const variantClasses = {
  default: '',
  filled: 'bg-current text-white rounded-md',
  outline: 'border border-current rounded-md',
  ghost: 'hover:bg-current hover:text-white rounded-md',
  soft: 'bg-current/10 text-current rounded-md'
};

const shapeClasses = {
  square: '',
  rounded: 'rounded-lg',
  circle: 'rounded-full'
};

export default function IconWrapper({
  icon,
  children,
  className,
  size = 'md',
  color = 'neutral',
  variant = 'default',
  shape = 'square',
  animated = false,
  glow = false,
  pulse = false,
  tooltip,
  onClick,
  disabled = false,
  loading = false
}: IconWrapperProps) {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'transition-all duration-200 ease-out',
    'transform-gpu will-change-transform',
    sizeClasses[size],
    colorClasses[color],
    variantClasses[variant],
    shapeClasses[shape]
  ];

  if (animated) {
    baseClasses.push('hover:scale-110 active:scale-95');
  }

  if (glow) {
    baseClasses.push('shadow-lg');
    if (color !== 'white') {
      baseClasses.push(`drop-shadow-[0_0_8px_currentColor]`);
    }
  }

  if (pulse) {
    baseClasses.push('animate-pulse');
  }

  if (onClick && !disabled) {
    baseClasses.push('cursor-pointer');
  }

  if (disabled) {
    baseClasses.push('opacity-50 cursor-not-allowed pointer-events-none');
  }

  const iconElement = icon && React.isValidElement(icon) ? icon : null;
  const IconComponent = !iconElement && typeof icon === 'function' ? icon as LucideIcon : null;

  const content = (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className={cn('flex items-center justify-center', loading && 'opacity-0')}>
        {iconElement}
        {IconComponent && <IconComponent className={cn('w-full h-full', className)} />}
        {children}
      </div>
    </>
  );

  if (tooltip) {
    return (
      <div className="relative group">
        <div
          className={cn(baseClasses, className)}
          onClick={disabled ? undefined : onClick}
        >
          {content}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, className)}
      onClick={disabled ? undefined : onClick}
    >
      {content}
    </div>
  );
}

// Predefined icon sets for different contexts
export const AnalyticsIcons = {
  followers: Users,
  growth: TrendingUp,
  engagement: Heart,
  impressions: Eye,
  reach: Target,
  clicks: MousePointer,
  shares: Share,
  saves: Bookmark,
  comments: MessageCircle
};

export const NavigationIcons = {
  overview: BarChart3,
  analytics: TrendingUp,
  content: Calendar,
  research: Search,
  aiInsights: Sparkles,
  collaboration: UserCheck,
  system: Activity,
  profile: User,
  settings: Settings
};

export const ActionIcons = {
  add: Plus,
  remove: Minus,
  edit: Edit,
  delete: Trash2,
  copy: Copy,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  external: ExternalLink,
  save: Check,
  cancel: X
};

export const StatusIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: X,
  info: Info,
  loading: RefreshCw,
  clock: Clock,
  flag: Flag
};

export const ContentIcons = {
  image: Image,
  video: Video,
  file: FileText,
  archive: Archive,
  folder: Folder,
  camera: Camera,
  star: Star,
  bookmark: Bookmark,
  tag: Tag,
  hash: Hash
};

export const BusinessIcons = {
  dollar: DollarSign,
  card: CreditCard,
  cart: ShoppingCart,
  package: Package,
  truck: Truck,
  store: Store,
  building: Building,
  phone: Phone,
  mail: Mail,
  link: Link,
  globe: Globe,
  location: MapPin
};

// Enhanced icon components with common patterns
export const GradientIcon: React.FC<{
  icon: LucideIcon;
  from: string;
  to: string;
  size?: IconWrapperProps['size'];
  className?: string;
}> = ({ icon: Icon, from, to, size = 'md', className }) => (
  <div className={cn(
    'bg-gradient-to-br p-2 rounded-xl',
    from,
    to,
    'shadow-lg',
    className
  )}>
    <Icon className={cn(sizeClasses[size], 'text-white')} />
  </div>
);

export const StatusIcon: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info' | 'loading';
  size?: IconWrapperProps['size'];
  animated?: boolean;
}> = ({ status, size = 'md', animated = true }) => {
  const iconProps = {
    success: { icon: CheckCircle, color: 'success' as const },
    warning: { icon: AlertTriangle, color: 'warning' as const },
    error: { icon: X, color: 'error' as const },
    info: { icon: Info, color: 'info' as const },
    loading: { icon: RefreshCw, color: 'neutral' as const }
  };

  const { icon: Icon, color } = iconProps[status];

  return (
    <IconWrapper
      icon={Icon}
      color={color}
      size={size}
      animated={animated && status !== 'loading'}
      pulse={status === 'loading'}
    />
  );
};

export const MetricIcon: React.FC<{
  metric: keyof typeof AnalyticsIcons;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  size?: IconWrapperProps['size'];
}> = ({ metric, value, trend, size = 'md' }) => {
  const Icon = AnalyticsIcons[metric];
  const color = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'neutral';

  return (
    <div className="relative">
      <IconWrapper
        icon={Icon}
        color={color}
        size={size}
        variant="soft"
        shape="rounded"
        animated
      />
      {trend && (
        <div className={cn(
          'absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs',
          trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        )}>
          {trend === 'up' ? <ArrowUp className="w-2 h-2" /> : <ArrowDown className="w-2 h-2" />}
        </div>
      )}
    </div>
  );
};