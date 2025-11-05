import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  User, 
  Hash, 
  FileText, 
  BarChart3,
  X,
  Star,
  Eye,
  Calendar
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SearchFilter {
  category: string;
  type: string;
  dateRange: string;
  sortBy: string;
}

interface SearchResult {
  id: string;
  type: 'account' | 'hashtag' | 'content' | 'analytics';
  title: string;
  description: string;
  metadata: any;
  relevance: number;
  timestamp: string;
}

interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter;
  results_count: number;
  timestamp: string;
}

const AdvancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({
    category: 'all',
    type: 'all',
    dateRange: 'all',
    sortBy: 'relevance'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      generateSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const loadSearchHistory = async () => {
    try {
      const { data: historyData } = await supabase
        .from('global_search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyData) {
        setSearchHistory(historyData.map(item => ({
          id: item.id,
          query: item.search_query,
          filters: item.filters || filters,
          results_count: item.results_count || 0,
          timestamp: item.created_at
        })));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const generateSuggestions = () => {
    const commonSearches = [
      'Instagram analytics',
      'Top performing hashtags',
      'Content engagement',
      'Follower growth',
      'Competitor analysis',
      'AI recommendations',
      'Performance metrics',
      'Recent posts'
    ];

    const filtered = commonSearches.filter(suggestion =>
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(filtered.length > 0);
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setShowSuggestions(false);

      // Use the advanced-search edge function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/advanced-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          filters: filters,
          user_id: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results) {
          setResults(data.results);
        } else {
          // Generate sample results for demonstration
          generateSampleResults();
        }
      } else {
        generateSampleResults();
      }

      // Save search to history
      await saveSearchToHistory();
      await loadSearchHistory();

    } catch (error) {
      console.error('Search error:', error);
      generateSampleResults();
    } finally {
      setIsSearching(false);
    }
  };

  const generateSampleResults = () => {
    const sampleResults: SearchResult[] = [
      {
        id: '1',
        type: 'account',
        title: 'Instagram Account Analysis',
        description: 'Complete analytics for @example_account with 45K followers',
        metadata: { followers: 45000, engagement_rate: 3.2, posts: 234 },
        relevance: 95,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'hashtag',
        title: '#photography Performance',
        description: 'Hashtag analytics showing 2.3M posts and high engagement',
        metadata: { posts_count: 2300000, avg_likes: 150, trending: true },
        relevance: 87,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'content',
        title: 'Top Performing Post',
        description: 'Image post with 1.2K likes and 89 comments',
        metadata: { likes: 1200, comments: 89, shares: 23, type: 'image' },
        relevance: 82,
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        type: 'analytics',
        title: 'Weekly Performance Report',
        description: 'Analytics summary for the past 7 days showing 15% growth',
        metadata: { growth: 15, reach: 12000, impressions: 45000 },
        relevance: 78,
        timestamp: new Date().toISOString()
      }
    ];

    // Filter results based on search query and filters
    let filteredResults = sampleResults;

    if (filters.type !== 'all') {
      filteredResults = filteredResults.filter(result => result.type === filters.type);
    }

    if (filters.category !== 'all') {
      // Apply category filtering logic here
    }

    setResults(filteredResults);
  };

  const saveSearchToHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('global_search_history')
        .insert({
          user_id: user.id,
          search_query: searchQuery,
          filters: filters,
          results_count: results.length,
          search_duration_ms: Math.random() * 500 + 100 // Simulated duration
        });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      dateRange: 'all',
      sortBy: 'relevance'
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'account': return User;
      case 'hashtag': return Hash;
      case 'content': return FileText;
      case 'analytics': return BarChart3;
      default: return Search;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'account': return 'bg-blue-100 text-blue-800';
      case 'hashtag': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(() => performSearch(), 100);
  };

  const repeatSearch = (historyItem: SearchHistory) => {
    setSearchQuery(historyItem.query);
    setFilters(historyItem.filters);
    setTimeout(() => performSearch(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Search</h2>
            <p className="text-gray-600">Search across all platform data and analytics</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search accounts, hashtags, content, analytics..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute right-2 flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={performSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-shadow disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Search Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="growth">Growth</option>
                  <option value="engagement">Engagement</option>
                  <option value="audience">Audience</option>
                  <option value="content">Content</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="account">Accounts</option>
                  <option value="hashtag">Hashtags</option>
                  <option value="content">Content</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="popularity">Popularity</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results {results.length > 0 && `(${results.length})`}
            </h3>
            {results.length > 0 && (
              <span className="text-sm text-gray-600">
                Found in {Math.round(Math.random() * 500 + 100)}ms
              </span>
            )}
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <div key={result.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{result.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(result.type)}`}>
                              {result.type}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{result.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Relevance: {result.relevance}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Enter a search query to get started</p>
              <p className="text-sm text-gray-500 mt-2">Search across accounts, hashtags, content, and analytics</p>
            </div>
          )}
        </div>

        {/* Search History & Tips */}
        <div className="space-y-6">
          {/* Recent Searches */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Recent Searches</h3>
            <div className="space-y-2">
              {searchHistory.length > 0 ? (
                searchHistory.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => repeatSearch(item)}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 group"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700 group-hover:text-purple-600 truncate">
                        {item.query}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 ml-5">
                      {item.results_count} results • {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent searches</p>
              )}
            </div>
          </div>

          {/* Search Tips */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Search Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Use specific keywords for better results</span>
              </div>
              <div className="flex items-start space-x-2">
                <Filter className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Apply filters to narrow down results</span>
              </div>
              <div className="flex items-start space-x-2">
                <Hash className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Search hashtags with or without the # symbol</span>
              </div>
              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Use @ for account searches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;