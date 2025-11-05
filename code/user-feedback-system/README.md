# User Feedback Collection and Sentiment Analysis System

A comprehensive feedback system for the Instagram Analytics Platform that collects user feedback at optimal moments, analyzes sentiment, and provides actionable insights for product improvement.

## Features

### 🎯 **Feedback Collection**
- **In-app Feedback Widgets**: Contextual prompts that appear at optimal moments
- **Post-onboarding Surveys**: Gather feedback after user onboarding completion
- **Feature-specific Feedback**: Collect feedback on individual features and improvements
- **NPS Tracking**: Net Promoter Score monitoring with automated segmentation
- **Bug Report System**: Structured bug reporting with severity classification

### 📊 **Sentiment Analysis**
- **Real-time Sentiment Analysis**: Automatic analysis of feedback sentiment
- **Emotion Detection**: Identify joy, anger, sadness, fear, disgust, and surprise
- **Key Phrase Extraction**: Automatically extract important topics and themes
- **Confidence Scoring**: Provide confidence levels for sentiment predictions

### 📈 **Analytics Dashboard**
- **Overview Metrics**: Total feedback, average ratings, NPS scores, sentiment trends
- **Interactive Charts**: Trends, category breakdowns, and segment analysis
- **Real-time Updates**: Live feedback monitoring and alert system
- **Export Capabilities**: CSV, PDF, JSON, and XLSX export formats

### 🎨 **Smart Widgets**
- **Contextual Prompts**: Widgets that appear based on user behavior and journey stage
- **Multiple Widget Types**: NPS, Feature Rating, Bug Report, General Feedback
- **Customizable Appearance**: Configurable positioning, themes, and trigger conditions
- **Mobile Responsive**: Optimized for all device types

## System Architecture

```
├── 📁 components/           # React components
│   ├── FeedbackWidget.tsx   # Main feedback widget component
│   └── FeedbackDashboard.tsx # Analytics dashboard
├── 📁 services/            # API services
│   └── feedbackService.ts  # Backend API integration
├── 📁 utils/              # Utilities
│   └── sentimentAnalyzer.ts # Sentiment analysis engine
├── 📁 types/              # TypeScript definitions
│   └── index.ts           # All type definitions
├── 📁 supabase/           # Backend functions
│   └── functions/feedback-management/
└── 📁 database/           # Database schema
    └── schema.sql         # PostgreSQL schema
```

## Database Schema

The system uses PostgreSQL with the following key tables:

- **`user_feedback`**: Main feedback storage with sentiment analysis
- **`nps_responses`**: Net Promoter Score responses
- **`feedback_sentiment_analysis`**: Detailed sentiment analysis results
- **`feedback_categories`**: Feedback categorization system
- **`feedback_trends`**: Aggregated analytics data
- **`feedback_widget_config`**: Widget configuration and triggers

## Quick Start

### 1. Database Setup

```sql
-- Run the database schema
\i database-schema.sql
```

### 2. Deploy Supabase Functions

```bash
# Deploy the feedback management function
supabase functions deploy feedback-management
```

### 3. Install Dependencies

```bash
npm install recharts lucide-react
```

### 4. Add Widget to Your App

```tsx
import FeedbackWidget from './components/FeedbackWidget';
import { FeedbackWidgetConfig } from './types';

// Configure widget with trigger conditions
const npsWidgetConfig: Partial<FeedbackWidgetConfig> = {
  widget_type: 'nps',
  trigger_condition: {
    event: 'time_spent',
    delay: 60000, // Show after 1 minute
    min_session_duration: 30
  },
  position: 'bottom_right',
  title: 'How are we doing?',
  description: 'Your feedback helps us improve!'
};

function App() {
  return (
    <div>
      {/* Your app content */}
      
      {/* Add feedback widget */}
      <FeedbackWidget
        type="nps"
        trigger="automatic"
        config={npsWidgetConfig}
        onSubmit={(feedback) => console.log('Feedback submitted:', feedback)}
        onClose={() => console.log('Widget closed')}
      />
    </div>
  );
}
```

### 5. Set Up Dashboard

```tsx
import FeedbackAnalyticsDashboard from './components/FeedbackDashboard';

function AdminDashboard() {
  return (
    <div>
      <FeedbackAnalyticsDashboard
        dateRange={{
          start: '2024-01-01',
          end: '2024-01-31'
        }}
        onFilterChange={(filters) => console.log('Filters:', filters)}
      />
    </div>
  );
}
```

## Widget Configuration

### Widget Types

#### NPS Widget
```tsx
<FeedbackWidget
  type="nps"
  config={{
    trigger_condition: {
      event: 'time_spent',
      delay: 60000,
      min_session_duration: 60
    },
    title: 'Rate your experience',
    description: 'Help us improve by rating your experience'
  }}
/>
```

#### Feature Rating Widget
```tsx
<FeedbackWidget
  type="feature_rating"
  config={{
    trigger_condition: {
      event: 'feature_use',
      feature: 'dashboard',
      delay: 5000
    },
    position: 'center',
    title: 'Rate the Dashboard',
    description: 'How was your experience with the new dashboard?'
  }}
/>
```

#### Bug Report Widget
```tsx
<FeedbackWidget
  type="bug_report"
  config={{
    trigger_condition: {
      event: 'manual'
    },
    position: 'top_right',
    title: 'Report a Bug',
    description: 'Found an issue? Let us know!'
  }}
/>
```

### Trigger Conditions

```typescript
// Time-based triggers
{
  event: 'time_spent',
  delay: 60000, // Show after 1 minute
  min_session_duration: 30 // Only for sessions > 30 seconds
}

// Feature-based triggers
{
  event: 'feature_use',
  feature: 'analytics',
  delay: 10000 // Show 10 seconds after feature use
}

// Page-based triggers
{
  event: 'page_view',
  page: '/dashboard',
  delay: 30000,
  pages: ['/dashboard', '/analytics', '/reports']
}

// Manual trigger only
{
  event: 'manual'
}
```

## Sentiment Analysis

### Basic Usage

```typescript
import { sentimentAnalyzer } from './utils/sentimentAnalyzer';

const result = await sentimentAnalyzer.analyze('I love the new dashboard! It\'s amazing.');
console.log(result);
// {
//   score: 0.8,           // Very positive
//   confidence: 0.9,      // High confidence
//   emotions: {
//     joy: 0.8,
//     satisfaction: 0.9
//   },
//   key_phrases: ['love the new dashboard', 'amazing'],
//   language: 'en',
//   sentiment_label: 'positive'
// }
```

### Batch Analysis

```typescript
const texts = [
  'Great features!',
  'This is terrible',
  'Not bad, could be better'
];

const results = await sentimentAnalyzer.batchAnalyze(texts);
```

### Trend Analysis

```typescript
const feedbackData = [
  { text: 'Love the new features', timestamp: '2024-01-01' },
  { text: 'Still having issues', timestamp: '2024-01-02' },
  { text: 'Much improved!', timestamp: '2024-01-03' }
];

const trend = sentimentAnalyzer.analyzeSentimentTrend(feedbackData);
console.log(trend);
// {
//   trend: 'improving',
//   change_percentage: 15.2,
//   current_sentiment: 0.6,
//   previous_sentiment: 0.1
// }
```

## API Endpoints

### Submit Feedback
```bash
POST /api/feedback/submit
{
  "feedback_type": "nps",
  "rating": 8,
  "message": "Great platform!",
  "category": "general",
  "context": {
    "user_journey_stage": "active_use",
    "device_type": "desktop"
  }
}
```

### Get Dashboard Data
```bash
GET /api/feedback/dashboard?start_date=2024-01-01&end_date=2024-01-31
```

### Get Analytics
```bash
GET /api/feedback/analytics?start_date=2024-01-01&end_date=2024-01-31&include_raw_data=false
```

### Export Feedback
```bash
GET /api/feedback/export?format=csv&start_date=2024-01-01&end_date=2024-01-31
```

## Configuration

### Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Feedback Configuration
FEEDBACK_API_KEY=your-api-key
SENTIMENT_MODEL_VERSION=1.0.0
```

### Widget Configuration

Create widget configurations in the `feedback_widget_config` table:

```sql
INSERT INTO feedback_widget_config (
  widget_type,
  trigger_condition,
  position,
  title,
  description
) VALUES (
  'nps',
  '{"event": "time_spent", "delay": 60000}',
  'bottom_right',
  'How was your experience?',
  'Your feedback helps us improve!'
);
```

## Best Practices

### 🎯 **Optimal Timing**
- **NPS Prompts**: Show after 1-2 minutes of engagement or feature completion
- **Feature Feedback**: Trigger immediately after feature use
- **Bug Reports**: Make always accessible via floating button
- **General Feedback**: Show on exit intent or after significant session time

### 📊 **Sentiment Analysis**
- **Confidence Thresholds**: Only act on feedback with confidence > 0.7
- **Trend Monitoring**: Track sentiment changes over time
- **Keyword Extraction**: Use for feature request prioritization
- **Emotion Mapping**: Link emotions to specific UX improvements

### 🔧 **Implementation Tips**
1. **A/B Test Widgets**: Test different positions and timing
2. **Progressive Disclosure**: Start with simple questions, expand if engaged
3. **Value Exchange**: Always explain why feedback is requested
4. **Mobile Optimization**: Ensure widgets work well on mobile devices
5. **Performance**: Load widgets asynchronously to avoid blocking

### 📈 **Analytics & Reporting**
1. **Regular Reviews**: Weekly review of feedback trends
2. **Action Items**: Convert insights into concrete actions
3. **Segmentation**: Analyze feedback by user segments
4. **Correlation**: Link feedback with usage metrics
5. **ROI Tracking**: Measure impact of improvements on satisfaction

## Customization

### Custom Sentiment Analysis

```typescript
class CustomSentimentAnalyzer extends SentimentAnalyzer {
  protected positiveWords = new Set([
    // Add your domain-specific positive words
    'efficient', 'intuitive', 'powerful', 'seamless'
  ]);
  
  protected emotionKeywords = {
    productivity: ['efficient', 'streamlined', 'organized'],
    creativity: ['inspiring', 'innovative', 'flexible']
  };
}
```

### Custom Widget Themes

```css
.feedback-widget {
  --widget-primary: #3b82f6;
  --widget-secondary: #1e40af;
  --widget-text: #1f2937;
  --widget-background: #ffffff;
  --widget-border: #e5e7eb;
  --widget-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feedback-widget.dark {
  --widget-primary: #60a5fa;
  --widget-secondary: #3b82f6;
  --widget-text: #f9fafb;
  --widget-background: #1f2937;
  --widget-border: #374151;
}
```

## Monitoring & Alerts

### Feedback Health Metrics

```typescript
// Set up alerts for concerning trends
const alertConfig = {
  nps_drop_threshold: -10,    // Alert if NPS drops by 10 points
  negative_sentiment_spike: 0.3, // Alert if negative sentiment > 30%
  bug_report_volume: 50,      // Alert if > 50 bug reports per day
  response_time_threshold: 24 // hours
};
```

### Automated Actions

```typescript
// High-priority bug detection
if (feedback.priority === 'critical' && feedback.category === 'bug_report') {
  await createGitHubIssue(feedback);
  await notifyEngineering(feedback);
  await autoAssignToTeam('platform');
}

// Negative sentiment spike
if (average_sentiment < -0.5) {
  await triggerCustomerSuccessAlert();
  await scheduleLeadershipReview();
}
```

## Integration Examples

### With Existing Analytics

```typescript
import { analytics } from './analytics';

class FeedbackAnalyticsIntegration {
  async trackFeedbackInContext(feedback: UserFeedback) {
    // Track in your existing analytics
    analytics.track('feedback_submitted', {
      feedback_type: feedback.feedback_type,
      category: feedback.category,
      sentiment_score: feedback.sentiment_score,
      rating: feedback.rating
    });
    
    // Link with user journey events
    analytics.identify(feedback.user_id, {
      feedback_count: await this.getUserFeedbackCount(feedback.user_id),
      last_feedback_date: feedback.created_at,
      avg_sentiment: await this.getUserAvgSentiment(feedback.user_id)
    });
  }
}
```

### With Support Systems

```typescript
class FeedbackSupportIntegration {
  async handleNegativeFeedback(feedback: UserFeedback) {
    if (feedback.sentiment_score < -0.5) {
      // Create support ticket
      const ticket = await supportSystem.createTicket({
        subject: `User Feedback: ${feedback.category}`,
        description: feedback.message,
        priority: 'high',
        tags: ['feedback', feedback.category, 'negative_sentiment']
      });
      
      // Auto-assign based on category
      await this.autoAssignTicket(ticket, feedback.category);
    }
  }
}
```

## Performance Optimization

### Widget Loading
```typescript
// Lazy load widgets to improve performance
const FeedbackWidget = lazy(() => import('./FeedbackWidget'));

// Preload critical widgets
useEffect(() => {
  if (shouldShowNPS) {
    import('./FeedbackWidget').then(({ default: Widget }) => {
      setWidgetComponent(() => Widget);
    });
  }
}, [shouldShowNPS]);
```

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_feedback_user_created ON user_feedback(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_feedback_category_created ON user_feedback(category, created_at);
CREATE INDEX CONCURRENTLY idx_feedback_sentiment_created ON user_feedback(sentiment_score, created_at);

-- Partition large tables by month
CREATE TABLE user_feedback_y2024m01 PARTITION OF user_feedback
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Troubleshooting

### Common Issues

1. **Widget not showing**
   - Check trigger conditions in widget config
   - Verify user permissions and authentication
   - Check browser console for errors

2. **Sentiment analysis failing**
   - Verify text encoding (UTF-8)
   - Check for empty or null messages
   - Review confidence thresholds

3. **Dashboard not loading**
   - Check API endpoint availability
   - Verify database permissions
   - Review rate limiting settings

4. **Export functionality not working**
   - Check file size limits
   - Verify export permissions
   - Review timeout settings

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('feedback_debug', 'true');

// Debug widget triggers
if (localStorage.getItem('feedback_debug') === 'true') {
  console.log('Feedback widget trigger check:', {
    event: triggerCondition.event,
    delay: triggerCondition.delay,
    currentSession: getSessionDuration()
  });
}
```

## Support

For technical support or feature requests:
- 📧 Email: support@yourcompany.com
- 📚 Documentation: https://docs.yourcompany.com/feedback
- 🐛 Issues: https://github.com/yourcompany/feedback-system/issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the Instagram Analytics Platform