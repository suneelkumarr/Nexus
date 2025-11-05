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
  Target,
  ArrowUp,
  ArrowDown,
  Zap,
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3
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
    weeklyGrowth?: number;
    engagementRate?: number;
  };
}

interface WeeklyHighlight {
  metric: string;
  value: number;
  change: number;
  significance: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface NextBestAction {
  action: string;
  impact: string;
  timeRequired: string;
  buttonText: string;
  priority: 'high' | 'medium' | 'low';
}

export default function WelcomeHeader({ userProfile, userStats }: WelcomeHeaderProps) {
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weeklyHighlights, setWeeklyHighlights] = useState<WeeklyHighlight[]>([]);
  const [nextBestAction, setNextBestAction] = useState<NextBestAction | null>(null);

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

    // Generate weekly highlights and next best action based on user stats
    generateWeeklyInsights();

    return () => clearInterval(timer);
  }, [userStats]);

  const generateWeeklyInsights = () => {
    if (!userStats) return;

    const { followers = 0, posts = 0, accountType = 'personal', weeklyGrowth = 0, engagementRate = 0 } = userStats;
    
    // Generate weekly highlights based on account type and stats
    const highlights: WeeklyHighlight[] = [];
    
    // Follower growth highlight
    if (weeklyGrowth > 0) {
      highlights.push({
        metric: 'Follower Growth',
        value: weeklyGrowth,
        change: weeklyGrowth,
        significance: weeklyGrowth > 10 ? 'Strong momentum!' : 'Steady growth',
        icon: TrendingUp,
        color: weeklyGrowth > 10 ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-cyan-600'
      });
    }

    // Engagement highlight
    if (engagementRate > 0) {
      highlights.push({
        metric: 'Engagement Rate',
        value: engagementRate,
        change: engagementRate - 3.2, // Mock previous week comparison
        significance: engagementRate > 4 ? 'Above average!' : 'Room to improve',
        icon: Heart,
        color: engagementRate > 4 ? 'from-pink-500 to-rose-600' : 'from-yellow-500 to-orange-600'
      });
    }

    // Posting consistency
    if (posts > 0) {
      highlights.push({
        metric: 'Content Published',
        value: posts,
        change: posts > 10 ? 15 : 5, // Mock change
        significance: posts >= 14 ? 'Very consistent!' : 'Keep posting regularly',
        icon: Calendar,
        color: posts >= 14 ? 'from-purple-500 to-indigo-600' : 'from-gray-500 to-slate-600'
      });
    }

    setWeeklyHighlights(highlights);

    // Generate next best action based on account type and current stats
    let action: NextBestAction;
    
    if (accountType === 'business') {
      if (weeklyGrowth < 5) {
        action = {
          action: 'Post during peak hours (9-11 AM weekdays)',
          impact: 'Could increase reach by 40%',
          timeRequired: '2 min',
          buttonText: 'Schedule Now',
          priority: 'high'
        };
      } else {
        action = {
          action: 'Create behind-the-scenes content',
          impact: 'Likely to boost engagement by 30%',
          timeRequired: '15 min',
          buttonText: 'Get Ideas',
          priority: 'medium'
        };
      }
    } else if (accountType === 'creator') {
      if (engagementRate < 3) {
        action = {
          action: 'Add interactive stories with polls',
          impact: 'Could improve engagement by 60%',
          timeRequired: '5 min',
          buttonText: 'Create Story',
          priority: 'high'
        };
      } else {
        action = {
          action: 'Share more authentic, personal content',
          impact: 'Build stronger community connections',
          timeRequired: '10 min',
          buttonText: 'Share Story',
          priority: 'medium'
        };
      }
    } else {
      if (weeklyGrowth < 3) {
        action = {
          action: 'Engage with 10 accounts in your niche',
          impact: 'Potential for 25% follower growth',
          timeRequired: '10 min',
          buttonText: 'Start Engaging',
          priority: 'high'
        };
      } else {
        action = {
          action: 'Share a personal story or experience',
          impact: 'Stories get 56% more engagement',
          timeRequired: '5 min',
          buttonText: 'Create Story',
          priority: 'medium'
        };
      }
    }

    setNextBestAction(action);
  };

  const getGreeting = () => {
    const name = userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
    
    switch (timeOfDay) {
      case 'morning':
        return {
          greeting: `Good morning`,
          message: `Ready to accelerate your growth today?`,
          icon: Sunrise,
          gradient: 'from-orange-400 to-yellow-500'
        };
      case 'afternoon':
        return {
          greeting: `Good afternoon`,
          message: `Let's make this afternoon productive!`,
          icon: Sun,
          gradient: 'from-blue-400 to-cyan-500'
        };
      case 'evening':
        return {
          greeting: `Good evening`,
          message: `Time to review and optimize!`,
          icon: Sunset,
          gradient: 'from-purple-400 to-pink-500'
        };
    }
  };

  const greetingInfo = getGreeting();
  const GreetingIcon = greetingInfo.icon;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent transform rotate-45 translate-x-[-50%] translate-y-[-50%]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {/* Time-based Greeting */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${greetingInfo.gradient} bg-opacity-20`}>
                <GreetingIcon className="h-5 w-5 text-white" />
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

            {/* Weekly Highlights */}
            {weeklyHighlights.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-yellow-300" />
                  This Week's Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {weeklyHighlights.map((highlight, index) => {
                    const Icon = highlight.icon;
                    return (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-white/80" />
                          <span className="text-white/70 text-xs font-medium">{highlight.metric}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">
                            +{highlight.change}%
                          </span>
                          {highlight.change > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-300" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-300" />
                          )}
                        </div>
                        <p className="text-white/60 text-xs mt-1">{highlight.significance}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Best Action */}
            {nextBestAction && (
              <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-300" />
                      Next Best Action
                    </h3>
                    <p className="text-white/90 text-sm mb-3">{nextBestAction.action}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-white/70" />
                        <span className="text-white/70">{nextBestAction.impact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-white/70" />
                        <span className="text-white/70">{nextBestAction.timeRequired}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(nextBestAction.priority)}`}>
                        {nextBestAction.priority} priority
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {nextBestAction.buttonText}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Performance Snapshot */}
            {userStats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-white/80" />
                    <span className="text-white/60 text-xs font-medium">Type</span>
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
          </div>

          {/* User Avatar */}
          <div className="hidden md:block ml-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
              <span className="text-white font-bold text-2xl">
                {(userProfile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Success Indicator */}
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-300" />
          <span className="text-white/90 text-sm">
            You're making great progress! Keep optimizing for better results.
          </span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-4 right-8 w-6 h-6 bg-white/5 rounded-full animate-pulse delay-300"></div>
      <div className="absolute top-1/2 right-12 w-4 h-4 bg-white/10 rounded-full animate-pulse delay-700"></div>
    </div>
  );
}
