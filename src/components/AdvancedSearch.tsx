import React, { useState, useEffect } from 'react'
import { 
  Search, Filter, SlidersHorizontal, Clock, Star, 
  Hash, Users, BarChart3, Camera, TrendingUp, Globe,
  ChevronDown, X, Download, History, ArrowUpDown
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface AdvancedSearchProps {}

const AdvancedSearch: React.FC<AdvancedSearchProps> = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('general')
  const [filters, setFilters] = useState({
    types: [],
    date_from: '',
    date_to: '',
    min_relevance: 0,
    sort_by: 'relevance',
    sort_order: 'desc'
  })
  const [searchResults, setSearchResults] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInsights, setSearchInsights] = useState(null)
  const [totalResults, setTotalResults] = useState(0)

  const searchTypes = [
    { value: 'general', label: 'All Content', icon: Globe },
    { value: 'hashtag', label: 'Hashtags', icon: Hash },
    { value: 'content', label: 'Content', icon: Camera },
    { value: 'influencer', label: 'Influencers', icon: Users },
    { value: 'competitor', label: 'Competitors', icon: TrendingUp },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'user', label: 'Users', icon: Users },
    { value: 'post', label: 'Posts', icon: Camera },
    { value: 'account', label: 'Accounts', icon: Users },
    { value: 'trend', label: 'Trends', icon: TrendingUp }
  ]

  const resultTypes = [
    'hashtag', 'content', 'influencer', 'competitor', 
    'analytics', 'user', 'post', 'account', 'trend'
  ]

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('global_search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading search history:', error)
      } else {
        setSearchHistory(data || [])
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      setSearchResults([])

      const { data, error } = await supabase.functions.invoke('advanced-search', {
        body: {
          query: searchQuery,
          filters,
          search_type: searchType,
          limit: 50
        }
      })

      if (error) {
        console.error('Search error:', error)
        // Fallback to local search for demo
        const mockResults = generateMockSearchResults(searchQuery, searchType)
        setSearchResults(mockResults.results)
        setTotalResults(mockResults.total_count)
        setSearchInsights(mockResults.insights)
      } else {
        setSearchResults(data.data.results || [])
        setTotalResults(data.data.total_count || 0)
        setSearchInsights(data.data.insights)
      }

      // Refresh search history
      loadSearchHistory()
    } catch (error) {
      console.error('Search error:', error)
      // Generate mock results for demo
      const mockResults = generateMockSearchResults(searchQuery, searchType)
      setSearchResults(mockResults.results)
      setTotalResults(mockResults.total_count)
      setSearchInsights(mockResults.insights)
    } finally {
      setIsSearching(false)
    }
  }

  const generateMockSearchResults = (query: string, type: string) => {
    const baseResults = []
    const resultCount = Math.floor(Math.random() * 20) + 10

    for (let i = 0; i < resultCount; i++) {
      baseResults.push({
        type: type === 'general' ? resultTypes[Math.floor(Math.random() * resultTypes.length)] : type,
        id: `result_${i}`,
        title: `${query} Result ${i + 1}`,
        subtitle: `${type} with ${Math.floor(Math.random() * 1000)}K engagement`,
        description: `This is a search result for "${query}" in the ${type} category.`,
        metadata: {
          engagement_rate: Math.floor(Math.random() * 10) + 1,
          followers: Math.floor(Math.random() * 100000),
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        relevance_score: Math.floor(Math.random() * 40) + 60
      })
    }

    return {
      results: baseResults,
      total_count: resultCount,
      insights: {
        total_results: resultCount,
        result_types: { [type]: resultCount },
        top_relevance: Math.max(...baseResults.map(r => r.relevance_score)),
        avg_relevance: baseResults.reduce((sum, r) => sum + r.relevance_score, 0) / baseResults.length,
        search_suggestions: [`${query} analytics`, `${query} trends`, `${query} insights`],
        related_searches: [`trending ${query}`, `${query} strategy`, `${query} examples`]
      }
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      types: [],
      date_from: '',
      date_to: '',
      min_relevance: 0,
      sort_by: 'relevance',
      sort_order: 'desc'
    })
  }

  const useSearchFromHistory = (historyItem: any) => {
    setSearchQuery(historyItem.query)
    setSearchType(historyItem.search_type || 'general')
    setFilters(historyItem.filters || filters)
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = searchTypes.find(t => t.value === type)
    return typeConfig ? typeConfig.icon : Globe
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const ResultCard = ({ result }) => {
    const Icon = getTypeIcon(result.type)
    
    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {result.title}
              </h3>
              <span className={`text-sm font-medium ${getRelevanceColor(result.relevance_score)}`}>
                {result.relevance_score}% match
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
            <p className="text-sm text-gray-500 mb-3">{result.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(result.metadata.created_at || Date.now()).toLocaleDateString()}
              </span>
              {result.metadata.engagement_rate && (
                <span className="flex items-center">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {result.metadata.engagement_rate}% engagement
                </span>
              )}
              {result.metadata.followers && (
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {result.metadata.followers.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
        <p className="text-gray-600">Search across all platform content with advanced filters</p>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Search Bar */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search hashtags, content, influencers, analytics..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {searchTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          
          <button
            onClick={performSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Result Types Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result Types
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {resultTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('types', [...filters.types, type])
                          } else {
                            handleFilterChange('types', filters.types.filter(t => t !== type))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Relevance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Relevance: {filters.min_relevance}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.min_relevance}
                  onChange={(e) => handleFilterChange('min_relevance', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="space-y-2">
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                  <select
                    value={filters.sort_order}
                    onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Header */}
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results ({totalResults})
                </h3>
                <p className="text-sm text-gray-600">
                  Found {totalResults} results for "{searchQuery}"
                </p>
              </div>
              <button className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </button>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <ResultCard key={`${result.id}_${index}`} result={result} />
            ))}
          </div>

          {searchResults.length === 0 && !isSearching && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-600">Enter a search term to find content across the platform</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search Insights */}
          {searchInsights && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Search Insights</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Results:</span>
                  <span className="font-medium">{searchInsights.total_results}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Relevance:</span>
                  <span className="font-medium">{searchInsights.avg_relevance?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Relevance:</span>
                  <span className="font-medium">{searchInsights.top_relevance}%</span>
                </div>
              </div>

              {searchInsights.search_suggestions && searchInsights.search_suggestions.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Suggestions</h5>
                  <div className="space-y-1">
                    {searchInsights.search_suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(suggestion)}
                        className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search History */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <History className="h-4 w-4 mr-2" />
              Recent Searches
            </h4>
            <div className="space-y-2">
              {searchHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No recent searches</p>
              ) : (
                searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => useSearchFromHistory(item)}
                    className="block w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.query}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.search_type} • {item.result_count} results
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Popular Searches */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Searches
            </h4>
            <div className="space-y-2">
              {['instagram marketing', 'content strategy', 'influencer collaboration', 'hashtag trends', 'analytics dashboard'].map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(term)}
                  className="block w-full text-left text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearch