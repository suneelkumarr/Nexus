import React from 'react';
import { cn } from '../lib/utils';
import { Card } from './ui';

interface SocialProofProps {
  content: {
    text: string;
    author: string;
    company: string;
    avatar?: string;
  };
  position: 'top' | 'middle' | 'bottom' | 'floating' | 'inline';
  className?: string;
}

export const SocialProof: React.FC<SocialProofProps> = ({
  content,
  position,
  className
}) => {
  const positionClasses = {
    top: "mb-8",
    middle: "my-8",
    bottom: "mt-8",
    floating: "absolute right-4 top-4 max-w-sm",
    inline: "inline-block"
  };

  const cardContent = (
    <Card className={cn(
      "text-center",
      position === 'floating' ? "p-4" : "p-6",
      className
    )}>
      <blockquote className={cn(
        "text-gray-700 italic mb-4",
        position === 'floating' ? "text-sm" : "text-base"
      )}>
        "{content.text}"
      </blockquote>
      <div className={cn(
        "flex items-center justify-center",
        position === 'floating' ? "space-x-2" : "space-x-3"
      )}>
        {content.avatar ? (
          <img
            src={content.avatar}
            alt={content.author}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {content.author.charAt(0)}
          </div>
        )}
        <div className="text-left">
          <div className={cn(
            "font-semibold text-gray-900",
            position === 'floating' ? "text-sm" : "text-base"
          )}>
            {content.author}
          </div>
          <div className={cn(
            "text-gray-600",
            position === 'floating' ? "text-xs" : "text-sm"
          )}>
            {content.company}
          </div>
        </div>
      </div>
    </Card>
  );

  if (position === 'floating') {
    return <div className={cn("relative", className)}>{cardContent}</div>;
  }

  return cardContent;
};

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => (
        <svg
          key={i}
          className={cn(
            sizeClasses[size],
            i < rating ? "text-yellow-400" : "text-gray-300"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};