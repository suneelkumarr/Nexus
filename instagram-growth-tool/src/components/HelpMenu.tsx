import { useState } from 'react';
import { HelpCircle, X, PlayCircle, Book, MessageCircle, Mail } from 'lucide-react';

interface HelpMenuProps {
  onStartGuidedTour: () => void;
}

export default function HelpMenu({ onStartGuidedTour }: HelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const helpItems = [
    {
      icon: PlayCircle,
      title: 'Start Guided Tour',
      description: 'Learn how to use GrowthHub with a step-by-step walkthrough',
      action: () => {
        setIsOpen(false);
        onStartGuidedTour();
      }
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'Read our comprehensive guides and tutorials',
      action: () => {
        window.open('https://docs.growthhub.com', '_blank');
        setIsOpen(false);
      }
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: () => {
        // Open live chat widget
        window.open('https://support.growthhub.com/chat', '_blank');
        setIsOpen(false);
      }
    },
    {
      icon: Mail,
      title: 'Contact Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      action: () => {
        window.open('mailto:support@growthhub.com', '_blank');
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Help & Support"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Help Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">Help & Support</h2>
                  <p className="text-white/80 text-sm">How can we help you today?</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {helpItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group text-left"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                          <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Need more help?
                  </p>
                  <a
                    href="https://support.growthhub.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    Visit our Help Center →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}