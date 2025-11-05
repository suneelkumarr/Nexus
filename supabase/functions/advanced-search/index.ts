import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { query, filters, search_type, limit } = await req.json()

    if (!query || query.trim() === '') {
      throw new Error('Search query is required')
    }

    // Record the search in history
    await recordSearchHistory(supabaseClient, user.id, query, filters, search_type)

    // Perform the search based on type
    let searchResults = []
    let resultCount = 0

    switch (search_type) {
      case 'hashtag':
        searchResults = await searchHashtags(supabaseClient, user.id, query, filters, limit)
        break
      case 'content':
        searchResults = await searchContent(supabaseClient, user.id, query, filters, limit)
        break
      case 'influencer':
        searchResults = await searchInfluencers(supabaseClient, user.id, query, filters, limit)
        break
      case 'competitor':
        searchResults = await searchCompetitors(supabaseClient, user.id, query, filters, limit)
        break
      case 'analytics':
        searchResults = await searchAnalytics(supabaseClient, user.id, query, filters, limit)
        break
      case 'user':
        searchResults = await searchUsers(supabaseClient, user.id, query, filters, limit)
        break
      case 'post':
        searchResults = await searchPosts(supabaseClient, user.id, query, filters, limit)
        break
      case 'account':
        searchResults = await searchAccounts(supabaseClient, user.id, query, filters, limit)
        break
      case 'trend':
        searchResults = await searchTrends(supabaseClient, user.id, query, filters, limit)
        break
      default:
        searchResults = await performGlobalSearch(supabaseClient, user.id, query, filters, limit)
        break
    }

    resultCount = searchResults.length

    // Update search history with result count
    await updateSearchHistoryCount(supabaseClient, user.id, query, resultCount)

    // Apply additional filtering and sorting
    const filteredResults = applyAdvancedFilters(searchResults, filters)
    const sortedResults = applySorting(filteredResults, filters?.sort_by, filters?.sort_order)

    // Generate search insights
    const insights = generateSearchInsights(sortedResults, query, search_type)

    return new Response(
      JSON.stringify({ 
        data: {
          results: sortedResults,
          total_count: resultCount,
          filtered_count: filteredResults.length,
          query,
          search_type,
          filters,
          insights,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in advanced-search:', error)
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'ADVANCED_SEARCH_ERROR',
          message: error.message 
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function recordSearchHistory(supabaseClient: any, userId: string, query: string, filters: any, searchType: string) {
  try {
    const startTime = Date.now()
    
    const { error } = await supabaseClient
      .from('global_search_history')
      .insert({
        user_id: userId,
        query: query.trim(),
        filters: filters || {},
        search_type: searchType || 'general',
        execution_time_ms: 0, // Will be updated later
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to record search history:', error)
    }
  } catch (error) {
    console.error('Error recording search history:', error)
  }
}

async function updateSearchHistoryCount(supabaseClient: any, userId: string, query: string, count: number) {
  try {
    const { error } = await supabaseClient
      .from('global_search_history')
      .update({ 
        result_count: count,
        execution_time_ms: Date.now() % 1000 // Simplified timing
      })
      .eq('user_id', userId)
      .eq('query', query.trim())
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Failed to update search history count:', error)
    }
  } catch (error) {
    console.error('Error updating search history:', error)
  }
}

async function searchHashtags(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('hashtag_performance')
    .select('*')
    .eq('user_id', userId)
    .or(`hashtag.ilike.%${query}%,category.ilike.%${query}%`)
    .order('media_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Hashtag search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'hashtag',
    id: item.id,
    title: item.hashtag,
    subtitle: `${item.media_count} posts`,
    description: `Category: ${item.category}`,
    metadata: {
      media_count: item.media_count,
      avg_likes: item.avg_likes,
      avg_comments: item.avg_comments,
      category: item.category
    },
    relevance_score: calculateRelevanceScore(query, item.hashtag)
  }))
}

async function searchContent(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('content_discoveries')
    .select('*')
    .eq('user_id', userId)
    .or(`content_type.ilike.%${query}%,description.ilike.%${query}%,hashtags.ilike.%${query}%`)
    .order('engagement_rate', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Content search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'content',
    id: item.id,
    title: item.content_type,
    subtitle: `${item.engagement_rate}% engagement`,
    description: item.description,
    metadata: {
      content_type: item.content_type,
      engagement_rate: item.engagement_rate,
      likes: item.likes,
      comments: item.comments,
      hashtags: item.hashtags
    },
    relevance_score: calculateRelevanceScore(query, `${item.content_type} ${item.description}`)
  }))
}

async function searchInfluencers(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('influencer_database')
    .select('*')
    .eq('user_id', userId)
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,category.ilike.%${query}%,bio.ilike.%${query}%`)
    .order('followers', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Influencer search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'influencer',
    id: item.id,
    title: item.username,
    subtitle: `${item.followers} followers`,
    description: item.bio,
    metadata: {
      username: item.username,
      full_name: item.full_name,
      followers: item.followers,
      following: item.following,
      engagement_rate: item.engagement_rate,
      category: item.category
    },
    relevance_score: calculateRelevanceScore(query, `${item.username} ${item.full_name} ${item.bio}`)
  }))
}

async function searchCompetitors(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('competitor_accounts')
    .select('*')
    .eq('user_id', userId)
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,category.ilike.%${query}%`)
    .order('followers', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Competitor search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'competitor',
    id: item.id,
    title: item.username,
    subtitle: `${item.followers} followers`,
    description: `Competitor in ${item.category}`,
    metadata: {
      username: item.username,
      full_name: item.full_name,
      followers: item.followers,
      following: item.following,
      category: item.category,
      added_date: item.created_at
    },
    relevance_score: calculateRelevanceScore(query, `${item.username} ${item.full_name} ${item.category}`)
  }))
}

async function searchAnalytics(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('analytics_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Analytics search error:', error)
    return []
  }

  // Filter based on query
  const filteredData = data.filter((item: any) => 
    JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
  )

  return filteredData.map((item: any) => ({
    type: 'analytics',
    id: item.id,
    title: `Analytics - ${new Date(item.snapshot_date).toLocaleDateString()}`,
    subtitle: `${item.follower_count} followers`,
    description: `Engagement: ${item.engagement_rate}%`,
    metadata: {
      snapshot_date: item.snapshot_date,
      follower_count: item.follower_count,
      following_count: item.following_count,
      post_count: item.post_count,
      engagement_rate: item.engagement_rate
    },
    relevance_score: calculateRelevanceScore(query, JSON.stringify(item))
  }))
}

async function searchUsers(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  // Search across team members and user permissions
  const { data, error } = await supabaseClient
    .from('team_members')
    .select('*, team_management(*)')
    .or(`email.ilike.%${query}%,role.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('User search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'user',
    id: item.id,
    title: item.email,
    subtitle: `Role: ${item.role}`,
    description: `Status: ${item.status}`,
    metadata: {
      email: item.email,
      role: item.role,
      status: item.status,
      joined_date: item.created_at,
      team: item.team_management?.team_name
    },
    relevance_score: calculateRelevanceScore(query, `${item.email} ${item.role}`)
  }))
}

async function searchPosts(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('media_insights')
    .select('*')
    .eq('user_id', userId)
    .or(`caption.ilike.%${query}%,media_type.ilike.%${query}%`)
    .order('like_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Post search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'post',
    id: item.id,
    title: item.caption ? item.caption.substring(0, 50) + '...' : 'Post',
    subtitle: `${item.like_count} likes, ${item.comment_count} comments`,
    description: `Posted: ${new Date(item.timestamp).toLocaleDateString()}`,
    metadata: {
      media_type: item.media_type,
      caption: item.caption,
      like_count: item.like_count,
      comment_count: item.comment_count,
      share_count: item.share_count,
      timestamp: item.timestamp
    },
    relevance_score: calculateRelevanceScore(query, `${item.caption} ${item.media_type}`)
  }))
}

async function searchAccounts(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', userId)
    .or(`username.ilike.%${query}%,account_type.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Account search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'account',
    id: item.id,
    title: item.username,
    subtitle: item.account_type,
    description: `Added: ${new Date(item.created_at).toLocaleDateString()}`,
    metadata: {
      username: item.username,
      account_type: item.account_type,
      is_verified: item.is_verified,
      is_connected: item.is_connected,
      added_date: item.created_at
    },
    relevance_score: calculateRelevanceScore(query, `${item.username} ${item.account_type}`)
  }))
}

async function searchTrends(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  const { data, error } = await supabaseClient
    .from('hashtag_monitoring')
    .select('*')
    .eq('user_id', userId)
    .or(`hashtag.ilike.%${query}%,trend_status.ilike.%${query}%`)
    .order('growth_rate', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Trend search error:', error)
    return []
  }

  return data.map((item: any) => ({
    type: 'trend',
    id: item.id,
    title: item.hashtag,
    subtitle: `${item.growth_rate}% growth`,
    description: `Status: ${item.trend_status}`,
    metadata: {
      hashtag: item.hashtag,
      growth_rate: item.growth_rate,
      trend_status: item.trend_status,
      post_count: item.post_count,
      monitoring_since: item.created_at
    },
    relevance_score: calculateRelevanceScore(query, `${item.hashtag} ${item.trend_status}`)
  }))
}

async function performGlobalSearch(supabaseClient: any, userId: string, query: string, filters: any, limit = 50) {
  // Perform search across multiple tables
  const searchPromises = [
    searchHashtags(supabaseClient, userId, query, filters, 10),
    searchContent(supabaseClient, userId, query, filters, 10),
    searchInfluencers(supabaseClient, userId, query, filters, 10),
    searchCompetitors(supabaseClient, userId, query, filters, 10),
    searchAnalytics(supabaseClient, userId, query, filters, 10)
  ]

  const results = await Promise.allSettled(searchPromises)
  
  // Combine and flatten all results
  const allResults = results
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<any>).value)
    .flat()

  // Sort by relevance score and limit
  return allResults
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit)
}

function calculateRelevanceScore(query: string, text: string): number {
  if (!text) return 0
  
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    const position = textLower.indexOf(queryLower)
    const score = 100 - (position * 2) // Earlier matches score higher
    return Math.max(score, 50)
  }
  
  // Partial word matches
  const queryWords = queryLower.split(/\s+/)
  const textWords = textLower.split(/\s+/)
  
  let matchCount = 0
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        matchCount++
      }
    })
  })
  
  return (matchCount / queryWords.length) * 40
}

function applyAdvancedFilters(results: any[], filters: any) {
  if (!filters) return results
  
  let filtered = [...results]
  
  // Apply type filter
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(item => filters.types.includes(item.type))
  }
  
  // Apply date range filter
  if (filters.date_from || filters.date_to) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.metadata.created_at || item.metadata.timestamp || item.metadata.added_date)
      const dateFrom = filters.date_from ? new Date(filters.date_from) : new Date('1900-01-01')
      const dateTo = filters.date_to ? new Date(filters.date_to) : new Date()
      
      return itemDate >= dateFrom && itemDate <= dateTo
    })
  }
  
  // Apply minimum relevance score filter
  if (filters.min_relevance) {
    filtered = filtered.filter(item => item.relevance_score >= filters.min_relevance)
  }
  
  return filtered
}

function applySorting(results: any[], sortBy = 'relevance', sortOrder = 'desc') {
  return results.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'relevance':
        aValue = a.relevance_score
        bValue = b.relevance_score
        break
      case 'date':
        aValue = new Date(a.metadata.created_at || a.metadata.timestamp || a.metadata.added_date)
        bValue = new Date(b.metadata.created_at || b.metadata.timestamp || b.metadata.added_date)
        break
      case 'alphabetical':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      default:
        aValue = a.relevance_score
        bValue = b.relevance_score
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    }
  })
}

function generateSearchInsights(results: any[], query: string, searchType: string) {
  const insights = {
    total_results: results.length,
    result_types: {} as any,
    top_relevance: results.length > 0 ? results[0].relevance_score : 0,
    avg_relevance: results.length > 0 ? 
      results.reduce((sum, r) => sum + r.relevance_score, 0) / results.length : 0,
    search_suggestions: generateSearchSuggestions(query, results),
    related_searches: generateRelatedSearches(query, searchType)
  }
  
  // Count result types
  results.forEach(result => {
    insights.result_types[result.type] = (insights.result_types[result.type] || 0) + 1
  })
  
  return insights
}

function generateSearchSuggestions(query: string, results: any[]) {
  const suggestions = []
  
  // Extract common terms from high-relevance results
  const highRelevanceResults = results.filter(r => r.relevance_score > 70)
  const terms = new Set()
  
  highRelevanceResults.forEach(result => {
    const words = result.title.toLowerCase().split(/\s+/)
    words.forEach(word => {
      if (word.length > 3 && !query.toLowerCase().includes(word)) {
        terms.add(word)
      }
    })
  })
  
  // Return top 5 suggestions
  return Array.from(terms).slice(0, 5)
}

function generateRelatedSearches(query: string, searchType: string) {
  const related = []
  
  // Generate related searches based on type
  switch (searchType) {
    case 'hashtag':
      related.push(`trending ${query}`, `${query} analytics`, `${query} competition`)
      break
    case 'content':
      related.push(`${query} ideas`, `${query} strategy`, `${query} examples`)
      break
    case 'influencer':
      related.push(`${query} collaborations`, `${query} rates`, `${query} contact`)
      break
    default:
      related.push(`${query} trends`, `${query} insights`, `${query} analysis`)
  }
  
  return related.slice(0, 3)
}