import { 
  DashboardWidget, 
  ABTest, 
  ABTestVariant, 
  ConversionFunnel, 
  PerformanceMetrics,
  MetricAggregation 
} from '../types/index.js';

/**
 * Dashboard Widget Factory
 * Creates and manages different types of dashboard widgets
 */
export class DashboardWidgetFactory {
  private widgets: Map<string, DashboardWidget> = new Map();
  private dataStore: Map<string, any[]> = new Map();

  /**
   * Create a new widget
   */
  createWidget(widget: DashboardWidget): DashboardWidget {
    this.widgets.set(widget.id, widget);
    return widget;
  }

  /**
   * Get widget by ID
   */
  getWidget(id: string): DashboardWidget | undefined {
    return this.widgets.get(id);
  }

  /**
   * Get all widgets
   */
  getAllWidgets(): DashboardWidget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Update widget data
   */
  updateWidgetData(widgetId: string, data: any[]): void {
    this.dataStore.set(widgetId, data);
  }

  /**
   * Get widget data
   */
  getWidgetData(widgetId: string): any[] {
    return this.dataStore.get(widgetId) || [];
  }

  /**
   * Remove widget
   */
  removeWidget(id: string): boolean {
    return this.widgets.delete(id) && this.dataStore.delete(id);
  }
}

/**
 * Base Widget Class
 */
abstract class BaseWidget {
  protected config: Record<string, any>;
  protected data: any[] = [];
  protected isLoading: boolean = false;
  protected error: string | null = null;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  abstract render(): HTMLElement;
  abstract fetchData(): Promise<any[]>;
  abstract updateData(data: any[]): void;

  protected setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  protected setError(error: string): void {
    this.error = error;
  }

  protected formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }

  protected formatPercentage(num: number, decimals: number = 2): string {
    return `${this.formatNumber(num * 100, decimals)}%`;
  }

  protected formatCurrency(num: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(num);
  }

  protected createElement(tag: string, className?: string, text?: string): HTMLElement {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
}

/**
 * Metric Widget - Displays key performance indicators
 */
export class MetricWidget extends BaseWidget {
  private title: string;
  private metric: string;
  private format: 'number' | 'percentage' | 'currency';
  private trend?: { direction: 'up' | 'down' | 'neutral'; percentage: number };

  constructor(config: {
    title: string;
    metric: string;
    format?: 'number' | 'percentage' | 'currency';
    trend?: { direction: 'up' | 'down' | 'neutral'; percentage: number };
  }) {
    super(config);
    this.title = config.title;
    this.metric = config.metric;
    this.format = config.format || 'number';
    this.trend = config.trend;
  }

  async fetchData(): Promise<any[]> {
    this.setLoading(true);
    try {
      const response = await fetch(`/api/analytics/metrics/${this.metric}`);
      const data = await response.json();
      this.setLoading(false);
      return data;
    } catch (error) {
      this.setError('Failed to fetch metric data');
      this.setLoading(false);
      return [];
    }
  }

  updateData(data: any[]): void {
    this.data = data;
  }

  render(): HTMLElement {
    const container = this.createElement('div', 'widget metric-widget');
    
    const header = this.createElement('div', 'widget-header');
    const title = this.createElement('h3', 'widget-title', this.title);
    header.appendChild(title);
    
    const value = this.data.length > 0 ? this.data[0].value : 0;
    const displayValue = this.formatValue(value);
    
    const metricValue = this.createElement('div', 'metric-value', displayValue);
    
    if (this.trend) {
      const trend = this.createElement('div', `trend trend-${this.trend.direction}`);
      const arrow = this.trend.direction === 'up' ? '↗' : this.trend.direction === 'down' ? '↘' : '→';
      trend.textContent = `${arrow} ${this.formatPercentage(Math.abs(this.trend.percentage))}`;
      metricValue.appendChild(trend);
    }

    const valueContainer = this.createElement('div', 'value-container');
    valueContainer.appendChild(metricValue);

    container.appendChild(header);
    container.appendChild(valueContainer);

    if (this.isLoading) {
      container.appendChild(this.createElement('div', 'loading-spinner', 'Loading...'));
    }

    if (this.error) {
      container.appendChild(this.createElement('div', 'error-message', this.error));
    }

    return container;
  }

  private formatValue(value: number): string {
    switch (this.format) {
      case 'percentage':
        return this.formatPercentage(value);
      case 'currency':
        return this.formatCurrency(value);
      default:
        return this.formatNumber(value);
    }
  }
}

/**
 * Funnel Widget - Displays conversion funnel analysis
 */
export class FunnelWidget extends BaseWidget {
  private funnelId: string;
  private steps: Array<{
    name: string;
    users: number;
    rate: number;
  }> = [];

  constructor(config: { funnelId: string; title?: string }) {
    super(config);
    this.funnelId = config.funnelId;
  }

  async fetchData(): Promise<any[]> {
    this.setLoading(true);
    try {
      const response = await fetch(`/api/analytics/funnels/${this.funnelId}`);
      const data = await response.json();
      this.setLoading(false);
      return [data];
    } catch (error) {
      this.setError('Failed to fetch funnel data');
      this.setLoading(false);
      return [];
    }
  }

  updateData(data: any[]): void {
    if (data.length > 0) {
      const funnel: ConversionFunnel = data[0];
      this.steps = funnel.stepAnalytics.map(step => ({
        name: step.stepName,
        users: step.totalUsers,
        rate: step.completionRate,
      }));
    }
  }

  render(): HTMLElement {
    const container = this.createElement('div', 'widget funnel-widget');
    
    const header = this.createElement('div', 'widget-header');
    header.appendChild(this.createElement('h3', 'widget-title', 'Conversion Funnel'));
    container.appendChild(header);

    const funnelContainer = this.createElement('div', 'funnel-steps');
    
    this.steps.forEach((step, index) => {
      const stepElement = this.createElement('div', 'funnel-step');
      
      const stepInfo = this.createElement('div', 'step-info');
      stepInfo.appendChild(this.createElement('span', 'step-name', step.name));
      stepInfo.appendChild(this.createElement('span', 'step-users', `${step.users} users`));
      
      const progressBar = this.createElement('div', 'progress-bar');
      const progress = this.createElement('div', 'progress', '');
      progress.style.width = `${step.rate * 100}%`;
      progressBar.appendChild(progress);
      
      const percentage = this.createElement('span', 'step-percentage', this.formatPercentage(step.rate));
      
      stepElement.appendChild(stepInfo);
      stepElement.appendChild(progressBar);
      stepElement.appendChild(percentage);
      
      funnelContainer.appendChild(stepElement);

      // Add connector arrow (except for last step)
      if (index < this.steps.length - 1) {
        const connector = this.createElement('div', 'funnel-connector', '↓');
        funnelContainer.appendChild(connector);
      }
    });

    container.appendChild(funnelContainer);

    if (this.isLoading) {
      container.appendChild(this.createElement('div', 'loading-spinner', 'Loading...'));
    }

    if (this.error) {
      container.appendChild(this.createElement('div', 'error-message', this.error));
    }

    return container;
  }
}

/**
 * A/B Test Results Widget
 */
export class ABTestWidget extends BaseWidget {
  private testId: string;
  private variants: ABTestVariant[] = [];

  constructor(config: { testId: string; title?: string }) {
    super(config);
    this.testId = config.testId;
  }

  async fetchData(): Promise<any[]> {
    this.setLoading(true);
    try {
      const response = await fetch(`/api/analytics/ab-tests/${this.testId}`);
      const data = await response.json();
      this.setLoading(false);
      return [data];
    } catch (error) {
      this.setError('Failed to fetch A/B test data');
      this.setLoading(false);
      return [];
    }
  }

  updateData(data: any[]): void {
    if (data.length > 0) {
      const test: ABTest = data[0];
      this.variants = test.variants;
    }
  }

  render(): HTMLElement {
    const container = this.createElement('div', 'widget abtest-widget');
    
    const header = this.createElement('div', 'widget-header');
    header.appendChild(this.createElement('h3', 'widget-title', 'A/B Test Results'));
    container.appendChild(header);

    const variantsContainer = this.createElement('div', 'variants-container');
    
    this.variants.forEach((variant, index) => {
      const variantElement = this.createElement('div', 'abtest-variant');
      
      const variantHeader = this.createElement('div', 'variant-header');
      variantHeader.appendChild(this.createElement('span', 'variant-name', variant.name));
      
      if (variant.statisticalSignificance) {
        const significance = this.createElement('span', 'significance-badge', 'Significant');
        significance.classList.add('badge-success');
        variantHeader.appendChild(significance);
      } else {
        const significance = this.createElement('span', 'significance-badge', 'Not Significant');
        significance.classList.add('badge-warning');
        variantHeader.appendChild(significance);
      }
      
      variantElement.appendChild(variantHeader);
      
      const variantMetrics = this.createElement('div', 'variant-metrics');
      variantMetrics.appendChild(this.createElement('div', 'metric', `Conversion Rate: ${this.formatPercentage(variant.conversionRate || 0)}`));
      variantMetrics.appendChild(this.createElement('div', 'metric', `Sample Size: ${variant.sampleSize}`));
      variantMetrics.appendChild(this.createElement('div', 'metric', `Confidence: ${this.formatPercentage(variant.confidence)}`));
      
      if (variant.results.uplift !== undefined) {
        const upliftClass = variant.results.uplift >= 0 ? 'positive' : 'negative';
        variantMetrics.appendChild(this.createElement('div', `metric uplift-${upliftClass}`, 
          `Uplift: ${this.formatPercentage(Math.abs(variant.results.uplift))}`));
      }
      
      variantElement.appendChild(variantMetrics);
      variantsContainer.appendChild(variantElement);
    });

    container.appendChild(variantsContainer);

    if (this.isLoading) {
      container.appendChild(this.createElement('div', 'loading-spinner', 'Loading...'));
    }

    if (this.error) {
      container.appendChild(this.createElement('div', 'error-message', this.error));
    }

    return container;
  }
}

/**
 * Chart Widget - Generic chart component
 */
export class ChartWidget extends BaseWidget {
  private chartType: 'line' | 'bar' | 'pie' | 'area';
  private dataKey: string;

  constructor(config: { 
    chartType: 'line' | 'bar' | 'pie' | 'area';
    dataKey: string;
    title: string;
  }) {
    super(config);
    this.chartType = config.chartType;
    this.dataKey = config.dataKey;
  }

  async fetchData(): Promise<any[]> {
    this.setLoading(true);
    try {
      const response = await fetch(`/api/analytics/metrics/${this.dataKey}/time-series`);
      const data = await response.json();
      this.setLoading(false);
      return data;
    } catch (error) {
      this.setError('Failed to fetch chart data');
      this.setLoading(false);
      return [];
    }
  }

  updateData(data: any[]): void {
    this.data = data;
  }

  render(): HTMLElement {
    const container = this.createElement('div', 'widget chart-widget');
    
    const header = this.createElement('div', 'widget-header');
    header.appendChild(this.createElement('h3', 'widget-title', this.config.title));
    container.appendChild(header);

    const chartContainer = this.createElement('div', 'chart-container');
    
    // Simple canvas-based chart (in a real implementation, you'd use Chart.js or D3)
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 200;
    chartContainer.appendChild(canvas);

    // Simple rendering based on chart type
    this.renderChart(canvas, this.data);

    container.appendChild(chartContainer);

    if (this.isLoading) {
      container.appendChild(this.createElement('div', 'loading-spinner', 'Loading...'));
    }

    if (this.error) {
      container.appendChild(this.createElement('div', 'error-message', this.error));
    }

    return container;
  }

  private renderChart(canvas: HTMLCanvasElement, data: any[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx || data.length === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple line chart rendering
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * (canvas.width - 40) + 20;
      const y = canvas.height - 20 - ((value - minValue) / range) * (canvas.height - 40);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw point
      ctx.fillStyle = '#007bff';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.stroke();
  }
}

/**
 * Pre-configured dashboard widgets
 */
export const predefinedWidgets = {
  freeToProConversion: new MetricWidget({
    title: 'Free to Pro Conversion Rate',
    metric: 'free-to-pro-conversion',
    format: 'percentage',
  }),

  onboardingCompletion: new MetricWidget({
    title: 'Onboarding Completion Rate',
    metric: 'onboarding-completion',
    format: 'percentage',
  }),

  dailyActiveUsers: new MetricWidget({
    title: 'Daily Active Users',
    metric: 'daily-active-users',
    format: 'number',
  }),

  revenue: new MetricWidget({
    title: 'Monthly Revenue',
    metric: 'monthly-revenue',
    format: 'currency',
  }),

  conversionFunnel: new FunnelWidget({
    funnelId: 'free-to-pro-conversion',
  }),

  abTestResults: new ABTestWidget({
    testId: 'signup-flow-test',
  }),

  userEngagement: new ChartWidget({
    chartType: 'line',
    dataKey: 'user-engagement',
    title: 'User Engagement Over Time',
  }),
};

/**
 * Dashboard Manager
 */
export class DashboardManager {
  private factory: DashboardWidgetFactory;
  private refreshInterval: number = 60000; // 1 minute

  constructor() {
    this.factory = new DashboardWidgetFactory();
  }

  /**
   * Add widget to dashboard
   */
  addWidget(widget: DashboardWidget): void {
    this.factory.createWidget(widget);
    this.startWidgetRefresh(widget.id);
  }

  /**
   * Remove widget from dashboard
   */
  removeWidget(widgetId: string): void {
    this.factory.removeWidget(widgetId);
  }

  /**
   * Get all widgets
   */
  getWidgets(): DashboardWidget[] {
    return this.factory.getAllWidgets();
  }

  /**
   * Update widget data
   */
  updateWidgetData(widgetId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const widget = this.factory.getWidget(widgetId);
        if (!widget) throw new Error('Widget not found');

        const data = await (widget as any).fetchData();
        (widget as any).updateData(data);
        this.factory.updateWidgetData(widgetId, data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start real-time refresh for all widgets
   */
  startRealTimeRefresh(): void {
    setInterval(async () => {
      const widgets = this.getWidgets();
      await Promise.all(widgets.map(widget => 
        this.updateWidgetData(widget.id).catch(console.error)
      ));
    }, this.refreshInterval);
  }

  private startWidgetRefresh(widgetId: string): void {
    setInterval(() => {
      this.updateWidgetData(widgetId).catch(console.error);
    }, this.refreshInterval);
  }
}