// Feedback Service for Instagram Analytics Platform
import { 
  UserFeedback, 
  NPSResponse, 
  FeedbackFilter, 
  PaginatedResponse, 
  APIResponse,
  FeedbackDashboard,
  FeedbackAnalytics,
  FeedbackTrend
} from '../types';

export class FeedbackService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}/feedback${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Submit new feedback
  async submitFeedback(feedback: Partial<UserFeedback>): Promise<UserFeedback> {
    const response = await this.request<UserFeedback>('/submit', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Submit NPS response
  async submitNPSResponse(
    score: number, 
    reason?: string, 
    userSegment?: string
  ): Promise<NPSResponse> {
    const response = await this.request<NPSResponse>('/nps', {
      method: 'POST',
      body: JSON.stringify({ score, reason, user_segment: userSegment }),
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get user's feedback history
  async getUserFeedback(
    userId?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<PaginatedResponse<UserFeedback>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(userId && { user_id: userId }),
    });
    
    const response = await this.request<PaginatedResponse<UserFeedback>>(`/user?${params}`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get feedback with filters
  async getFeedback(
    filters: FeedbackFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<UserFeedback>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    const response = await this.request<PaginatedResponse<UserFeedback>>(`?${params}`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get dashboard data
  async getDashboard(
    dateRange?: { start: string; end: string }
  ): Promise<FeedbackDashboard> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.set('start_date', dateRange.start);
      params.set('end_date', dateRange.end);
    }
    
    const response = await this.request<FeedbackDashboard>(`/dashboard?${params}`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get feedback trends
  async getTrends(
    type: 'daily' | 'weekly' | 'monthly' = 'daily',
    dateRange?: { start: string; end: string }
  ): Promise<FeedbackTrend[]> {
    const params = new URLSearchParams({
      type,
      ...(dateRange && { 
        start_date: dateRange.start, 
        end_date: dateRange.end 
      }),
    });
    
    const response = await this.request<FeedbackTrend[]>(`/trends?${params}`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get analytics data
  async getAnalytics(
    dateRange: { start: string; end: string },
    includeRawData: boolean = false
  ): Promise<FeedbackAnalytics> {
    const params = new URLSearchParams({
      start_date: dateRange.start,
      end_date: dateRange.end,
      include_raw_data: includeRawData.toString(),
    });
    
    const response = await this.request<FeedbackAnalytics>(`/analytics?${params}`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Update feedback status
  async updateFeedbackStatus(
    feedbackId: string, 
    status: UserFeedback['status'],
    assignee?: string
  ): Promise<UserFeedback> {
    const response = await this.request<UserFeedback>(`/${feedbackId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, assigned_to: assignee }),
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get feedback statistics
  async getStatistics(
    dateRange?: { start: string; end: string }
  ): Promise<{
    total_feedback: number;
    average_rating: number;
    nps_score: number;
    sentiment_average: number;
    response_rate: number;
  }> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.set('start_date', dateRange.start);
      params.set('end_date', dateRange.end);
    }
    
    const response = await this.request<any>(`/statistics?${params}`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Export feedback data
  async exportData(
    format: 'csv' | 'pdf' | 'json' | 'xlsx',
    filters: FeedbackFilter = {},
    dateRange?: { start: string; end: string }
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...(dateRange && { 
        start_date: dateRange.start, 
        end_date: dateRange.end 
      }),
    });
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    const response = await fetch(`${this.baseUrl}/feedback/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Get feedback categories
  async getCategories(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    color_code: string;
    feedback_count: number;
  }>> {
    const response = await this.request<any>('/categories');
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Get widget configurations
  async getWidgetConfigs(): Promise<Array<{
    id: string;
    widget_type: string;
    is_active: boolean;
    trigger_condition: any;
    position: string;
    title: string;
    description: string;
  }>> {
    const response = await this.request<any>('/widget-configs');
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }

  // Create or update widget configuration
  async saveWidgetConfig(config: any): Promise<void> {
    const response = await this.request('/widget-configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
  }

  // Get automated response suggestions
  async getResponseSuggestions(
    feedbackId: string
  ): Promise<Array<{
    template_id: string;
    response_text: string;
    confidence: number;
  }>> {
    const response = await this.request<any>(`/${feedbackId}/response-suggestions`);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data!;
  }
}

export const feedbackService = new FeedbackService();