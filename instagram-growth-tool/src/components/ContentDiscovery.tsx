import { useState, useEffect } from 'react';
import { Search, Hash, MapPin, Compass, Save, TrendingUp, Clock, Eye, Heart, MessageCircle, Filter, Calendar, BarChart3, Star } from 'lucide-react';

interface ContentDiscoveryProps {
  selectedAccount: string | null;
}

interface TrendingContent {
  id: string;
  image: string;
  caption: string;
  hashtags: string[];
  engagement: number;
  views: number;
  likes: number;
  comments: number;
  timestamp: string;
  username: string;
  profilePic: string;
  trendScore: number;
}

interface TrendingHashtag {
  hashtag: string;
  posts: number;
  growth: number;
  engagement: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

interface ContentInsight {
  type: 'trending' | 'viral' | 'niche' | 'seasonal';
  title: string;
  description: string;
  metrics: {
    avgEngagement: number;
    postFrequency: number;
    bestTime: string;
  };
  examples: TrendingContent[];
}

export default function ContentDiscovery({ selectedAccount }: ContentDiscoveryProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'hashtags' | 'insights' | 'competitors'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  // Mock data - In real implementation, this would come from analytics APIs
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [contentInsights, setContentInsights] = useState<ContentInsight[]>([]);

  useEffect(() => {
    loadDiscoveryData();
  }, [timeRange, selectedCategory]);

  const loadDiscoveryData = () => {
    setLoading(true);
    
    // Generate trending content
    const content: TrendingContent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `content-${i}`,
      image: `https://picsum.photos/400/400?random=${i}`,
      caption: `This is trending content item ${i + 1} that shows amazing visuals and engagement patterns.`,
      hashtags: ['#instagood', '#photooftheday', '#beautiful', '#tbt', '#followme'].slice(0, Math.floor(Math.random() * 5) + 1),
      engagement: Math.floor(Math.random() * 50000) + 10000,
      views: Math.floor(Math.random() * 100000) + 50000,
      likes: Math.floor(Math.random() * 25000) + 5000,
      comments: Math.floor(Math.random() * 2000) + 500,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      username: `user${i + 1}`,
      profilePic: `https://i.pravatar.cc/150?img=${i + 1}`,
      trendScore: Math.floor(Math.random() * 100) + 1
    }));

    // Generate trending hashtags
    const hashtags: TrendingHashtag[] = [
      { hashtag: 'instagood', posts: 125000, growth: 15.2, engagement: 6.8, category: 'General', trend: 'up' },
      { hashtag: 'photooftheday', posts: 98000, growth: 12.8, engagement: 7.1, category: 'Photography', trend: 'up' },
      { hashtag: 'love', posts: 89000, growth: -2.1, engagement: 4.2, category: 'Lifestyle', trend: 'down' },
      { hashtag: 'travel', posts: 76000, growth: 18.5, engagement: 8.3, category: 'Travel', trend: 'up' },
      { hashtag: 'food', posts: 65000, growth: 9.7, engagement: 6.9, category: 'Food', trend: 'up' },
      { hashtag: 'fitness', posts: 58000, growth: 14.3, engagement: 7.8, category: 'Health', trend: 'up' },
      { hashtag: 'fashion', posts: 54000, growth: 6.2, engagement: 5.4, category: 'Fashion', trend: 'stable' },
      { hashtag: 'nature', posts: 49000, growth: 11.1, engagement: 8.1, category: 'Nature', trend: 'up' },
      { hashtag: 'art', posts: 42000, growth: 7.8, engagement: 9.2, category: 'Art', trend: 'up' },
      { hashtag: 'music', posts: 38000, growth: 4.5, engagement: 6.3, category: 'Entertainment', trend: 'stable' }
    ];

    // Generate content insights
    const insights: ContentInsight[] = [
      {
        type: 'trending',
        title: 'Golden Hour Photography',
        description: 'Content featuring golden hour lighting shows 34% higher engagement',
        metrics: { avgEngagement: 8.7, postFrequency: 2.3, bestTime: '6:30 PM' },
        examples: content.slice(0, 3)
      },
      {
        type: 'viral',
        title: 'Behind-the-Scenes Content',
        description: 'Authentic BTS content drives 45% more comments than polished posts',
        metrics: { avgEngagement: 12.4, postFrequency: 1.8, bestTime: '8:00 PM' },
        examples: content.slice(3, 6)
      },
      {
        type: 'niche',
        title: 'Pet Content Performance',
        description: 'Animal-related content has 67% higher saves rate',
        metrics: { avgEngagement: 9.8, postFrequency: 3.1, bestTime: '7:15 PM' },
        examples: content.slice(6, 9)
      }
    ];

    setTrendingContent(content);
    setTrendingHashtags(hashtags);
    setContentInsights(insights);
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const iconClass = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    return (
      <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'transform rotate-180' : ''} ${iconClass}`} />
    );
  };

  const renderTrendingContent = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="fitness">Fitness</option>
            <option value="fashion">Fashion</option>
            <option value="art">Art</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingContent.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
              <img 
                src={item.image} 
                alt="Trending content"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <Star className="h-3 w-3" />
                {item.trendScore}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {formatTimeAgo(item.timestamp)}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={item.profilePic} 
                  alt={item.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-gray-900 dark:text-white">@{item.username}</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {item.caption}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {item.hashtags.map((tag) => (
                  <span key={tag} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(item.likes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(item.comments)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(item.views)}</span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrendingHashtags = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hashtags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Trending Hashtags</h3>
          <div className="space-y-3">
            {trendingHashtags.map((hashtag) => (
              <div key={hashtag.hashtag} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">#{hashtag.hashtag}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{hashtag.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatNumber(hashtag.posts)} posts
                  </p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(hashtag.trend)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {hashtag.growth > 0 ? '+' : ''}{hashtag.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hashtag Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hashtag Performance</h3>
          <div className="space-y-4">
            {trendingHashtags.slice(0, 5).map((hashtag, index) => (
              <div key={hashtag.hashtag} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    #{hashtag.hashtag}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {hashtag.engagement.toFixed(1)}% avg engagement
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(hashtag.engagement / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentInsights = () => (
    <div className="space-y-6">
      {contentInsights.map((insight) => (
        <div key={insight.type} className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full text-sm">
              <BarChart3 className="h-4 w-4" />
              {insight.type}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {insight.metrics.avgEngagement}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Engagement</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {insight.metrics.postFrequency}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Posts/Week</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {insight.metrics.bestTime}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Time</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {insight.examples.map((example) => (
              <div key={example.id} className="relative">
                <img 
                  src={example.image} 
                  alt="Example content"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center justify-between">
                  <span>{formatNumber(example.likes)} likes</span>
                  <span>{formatTimeAgo(example.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Discovery</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Find trending content and hashtag opportunities</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hashtags, users, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
        {[
          { id: 'trending', name: 'Trending Content', icon: TrendingUp },
          { id: 'hashtags', name: 'Hashtag Trends', icon: Hash },
          { id: 'insights', name: 'Content Insights', icon: BarChart3 },
          { id: 'competitors', name: 'Competitor Analysis', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading discovery data...</span>
        </div>
      ) : (
        <div>
          {activeTab === 'trending' && renderTrendingContent()}
          {activeTab === 'hashtags' && renderTrendingHashtags()}
          {activeTab === 'insights' && renderContentInsights()}
          {activeTab === 'competitors' && (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Competitor Analysis</h3>
              <p className="text-gray-400 dark:text-gray-500">Analyze competitor performance and strategies</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}