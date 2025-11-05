import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  Sun, 
  Moon, 
  Sunset, 
  Sunrise,
  TrendingUp,
  Sparkles,
  Heart,
  Target
} from 'lucide-react';

interface WelcomeHeaderProps {
  userProfile: {
    full_name: string;
    company: string;
    bio: string;
  } | null;
  userStats?: {
    followers?: number;
    posts?: number;
    accountType?: 'business' | 'personal' | 'creator';
  };
}

export default function WelcomeHeader({ userProfile, userStats }: WelcomeHeaderProps) {
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay('afternoon');
      } else {
        setTimeOfDay('evening');
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const name = userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
    
    switch (timeOfDay) {
      case 'morning':
        return {
          greeting: `Good morning`,
          message: `Ready to grow your Instagram today?`,
          icon: Sunrise,
          gradient: 'from-orange-400 to-yellow-500'
        };
      case 'afternoon':
        return {
          greeting: `Good afternoon`,
          message: `Let's make your afternoon productive!`,
          icon: Sun,
          gradient: 'from-blue-400 to-cyan-500'
        };
      case 'evening':
        return {
          greeting: `Good evening`,
          message: `Time to review your day's performance!`,
          icon: Sunset,
          gradient: 'from-purple-400 to-pink-500'
        };
    }
  };

  const getPersonalizedMessage = () => {
    const { followers = 0, posts = 0, accountType = 'personal' } = userStats || {};
    
    if (accountType === 'business') {
      if (followers < 1000) {
        return "Building your brand's digital presence";
      } else if (followers < 10000) {
        return "Expanding your business reach";
      } else {
        return "Leading your industry on Instagram";
      }
    } else if (accountType === 'creator') {
      if (followers < 1000) {
        return "Creating your unique content journey";
      } else if (followers < 10000) {
        return "Growing your creative influence";
      } else {
        return "Inspiring your community daily";
      }
    } else {
      if (followers < 500) {
        return "Starting your Instagram adventure";
      } else if (followers < 2000) {
        return "Building meaningful connections";
      } else {
        return "Curating your personal brand";
      }
    }
  };

  const greetingInfo = getGreeting();
  const PersonalizedIcon = greetingInfo.icon;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent transform rotate-45 translate-x-[-50%] translate-y-[-50%]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Time-based Greeting */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${greetingInfo.gradient} bg-opacity-20`}>
                <PersonalizedIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {greetingInfo.greeting}, {userProfile?.full_name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-white/80 text-sm flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Personalized Message */}
            <p className="text-white/90 text-lg mb-6 max-w-2xl">
              {greetingInfo.message} {getPersonalizedMessage()}
            </p>

            {/* Quick Stats with Context */}
            {userStats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-white/80" />
                    <span className="text-white/60 text-xs font-medium">Followers</span>
                  </div>
                  <p className="text-white font-bold text-lg">
                    {userStats.followers?.toLocaleString() || '0'}
                  </p>
                  <p className="text-white/50 text-xs">
                    Last 30 days
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-white/80" />
                    <span className="text-white/60 text-xs font-medium">Posts</span>
                  </div>
                  <p className="text-white font-bold text-lg">
                    {userStats.posts?.toLocaleString() || '0'}
                  </p>
                  <p className="text-white/50 text-xs">
                    Total published
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-white/80" />
                    <span className="text-white/60 text-xs font-medium">Account Type</span>
                  </div>
                  <p className="text-white font-bold text-sm capitalize">
                    {userStats.accountType || 'Personal'}
                  </p>
                  <p className="text-white/50 text-xs">
                    Profile category
                  </p>
                </div>
              </div>
            )}

            {/* Welcome Back Message */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm">
                Welcome back! Your growth journey continues.
              </span>
            </div>
          </div>

          {/* User Avatar */}
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
              <span className="text-white font-bold text-2xl">
                {(userProfile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-4 right-8 w-6 h-6 bg-white/5 rounded-full animate-pulse delay-300"></div>
      <div className="absolute top-1/2 right-12 w-4 h-4 bg-white/10 rounded-full animate-pulse delay-700"></div>
    </div>
  );
}