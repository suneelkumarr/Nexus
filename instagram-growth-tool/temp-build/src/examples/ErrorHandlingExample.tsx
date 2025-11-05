// Example: How to integrate error handling in existing components
import React from 'react';
import AnalyticsWrapper from '@/components/AnalyticsWrapper';
import { useAnalyticsState } from '@/components/AnalyticsWrapper';

// Example component with error handling
export function ExampleAnalyticsComponent() {
  const { loading, error, empty, setLoading, setError, reset } = useAnalyticsState();
  const [data, setData] = React.useState(null);

  const loadData = async () => {
    setLoading(true);
    reset(); // Clear previous states
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate different scenarios
      const scenario = Math.random();
      
      if (scenario < 0.2) {
        // 20% chance of network error
        throw new Error('Failed to fetch: Network connection lost');
      } else if (scenario < 0.4) {
        // 20% chance of empty state
        setData(null);
        return;
      } else {
        // 60% chance of success
        setData({ followers: 1000, posts: 50, engagement: 3.2 });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  return (
    <AnalyticsWrapper
      loading={loading}
      error={error}
      empty={empty}
      onRetry={handleRetry}
      onRefreshData={loadData}
      onConnectAccount={() => console.log('Connect account')}
      onUpgrade={() => console.log('Upgrade plan')}
      compact={false}
    >
      {data && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Analytics Data</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.followers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.posts}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.engagement}%</div>
              <div className="text-sm text-gray-600">Engagement</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Data'}
        </button>
      </div>
    </AnalyticsWrapper>
  );
}

// Example: Direct integration without custom hook
export function DirectIntegrationExample() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [empty, setEmpty] = React.useState(null);

  const handleRetry = () => {
    setError(null);
    setEmpty(null);
    // Retry logic here
  };

  return (
    <AnalyticsWrapper
      loading={loading}
      error={error}
      empty={empty}
      onRetry={handleRetry}
      onRefreshData={handleRetry}
      compact={true}
    >
      <div>Your component content here</div>
    </AnalyticsWrapper>
  );
}

// Example: Specific error type handling
export function CustomErrorHandling() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleNetworkError = () => {
    setError(new Error('Failed to fetch: Network connection lost'));
  };

  const handlePermissionError = () => {
    setError(new Error('Permission denied: Access to Instagram account required'));
  };

  const handleRateLimitError = () => {
    setError(new Error('Rate limit exceeded: Too many requests'));
  };

  return (
    <div className="space-y-4">
      <AnalyticsWrapper
        loading={loading}
        error={error}
        onRetry={() => setError(null)}
        compact={true}
      >
        <div>Network error example</div>
      </AnalyticsWrapper>

      <div className="flex gap-2">
        <button onClick={handleNetworkError} className="px-3 py-1 bg-red-500 text-white rounded">
          Network Error
        </button>
        <button onClick={handlePermissionError} className="px-3 py-1 bg-blue-500 text-white rounded">
          Permission Error
        </button>
        <button onClick={handleRateLimitError} className="px-3 py-1 bg-yellow-500 text-white rounded">
          Rate Limit Error
        </button>
      </div>
    </div>
  );
}

export default ExampleAnalyticsComponent;