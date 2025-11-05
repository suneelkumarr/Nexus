import React, { useState } from 'react';
import LimitationMessage, { ContextualLimitationPrompt } from './LimitationMessage';
import { Button } from '@/components/ui/button';

const LimitationMessageTest = () => {
  const [showInline, setShowInline] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showContextual, setShowContextual] = useState(false);

  const mockContext = {
    feature: 'Instagram Accounts',
    currentUsage: 3,
    limit: 3,
    percentage: 100,
    daysRemaining: 14,
    premiumFeatures: [
      'Unlimited account connections',
      'Advanced analytics',
      'Team collaboration tools'
    ],
    potentialValue: 'Manage all your Instagram accounts in one place'
  };

  const handleUpgrade = () => {
    alert('Upgrade clicked! Redirecting to subscription page...');
  };

  const handleDismiss = () => {
    console.log('Dismiss clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            LimitationMessage Mobile Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Test all limitation message variants across different mobile sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Inline Variant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Compact inline message for limited spaces
            </p>
            <Button onClick={() => setShowInline(true)} className="w-full">
              Show Inline Message
            </Button>
            {showInline && (
              <div className="mt-4">
                <LimitationMessage
                  context={mockContext}
                  onUpgrade={handleUpgrade}
                  onDismiss={() => setShowInline(false)}
                  variant="inline"
                />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Modal Variant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Full-featured modal with detailed information
            </p>
            <Button onClick={() => setShowModal(true)} className="w-full">
              Show Modal Message
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Banner Variant</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Horizontal banner across the top
            </p>
            <Button onClick={() => setShowBanner(true)} className="w-full">
              Show Banner Message
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Contextual Prompt</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Floating prompt based on user behavior
            </p>
            <Button onClick={() => setShowContextual(true)} className="w-full">
              Show Contextual Prompt
            </Button>
          </div>
        </div>

        {/* Device Preview Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mobile Device Preview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Resize your browser window to test mobile responsiveness
          </p>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-medium mb-2">Inline Message (Mobile View)</h3>
              <div className="max-w-sm">
                <LimitationMessage
                  context={mockContext}
                  onUpgrade={handleUpgrade}
                  onDismiss={() => {}}
                  variant="inline"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-medium mb-2">Contextual Prompt (Mobile View)</h3>
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                <ContextualLimitationPrompt
                  trigger="content_locked"
                  onUpgrade={handleUpgrade}
                  onDismiss={() => {}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Optimization Features */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Mobile Optimization Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Thumb-Friendly Buttons</h3>
                <p className="text-gray-600 dark:text-gray-400">Minimum 44px touch targets for easy mobile interaction</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Stacked Content</h3>
                <p className="text-gray-600 dark:text-gray-400">Optimized vertical stacking for mobile screens</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Bottom Sheet Modal</h3>
                <p className="text-gray-600 dark:text-gray-400">Modal slides up from bottom on mobile devices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Responsive Typography</h3>
                <p className="text-gray-600 dark:text-gray-400">Adaptive font sizes for readability across devices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Progress Bar Optimization</h3>
                <p className="text-gray-600 dark:text-gray-400">Touch-friendly progress indicators</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Safe Area Support</h3>
                <p className="text-gray-600 dark:text-gray-400">Proper spacing for devices with notches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Resize browser window to test different mobile sizes (320px, 375px, 414px, etc.)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>Test all button interactions to ensure thumb-friendly sizing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Verify modal transitions and bottom sheet behavior on mobile</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Check progress bars and visual elements remain readable</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">5.</span>
              <span>Test contextual prompts in bottom-right corner on mobile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Modals */}
      {showModal && (
        <LimitationMessage
          context={mockContext}
          onUpgrade={handleUpgrade}
          onDismiss={() => setShowModal(false)}
          variant="modal"
        />
      )}

      {showBanner && (
        <LimitationMessage
          context={mockContext}
          onUpgrade={handleUpgrade}
          onDismiss={() => setShowBanner(false)}
          variant="banner"
        />
      )}

      {showContextual && (
        <ContextualLimitationPrompt
          trigger="content_locked"
          onUpgrade={handleUpgrade}
          onDismiss={() => setShowContextual(false)}
        />
      )}
    </div>
  );
};

export default LimitationMessageTest;