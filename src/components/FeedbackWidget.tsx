
import React, { useState, useEffect } from 'react';
import { ThumbUpIcon, ThumbDownIcon } from './Icons';

interface FeedbackWidgetProps {
  onFeedback: (feedback: 'like' | 'dislike') => void;
  contentId: string; // Used to reset the widget when content changes
  size?: 'sm' | 'md';
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ onFeedback, contentId, size = 'md' }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);

  // Reset feedback state when the content it's attached to changes
  useEffect(() => {
    setFeedbackGiven(null);
  }, [contentId]);

  const handleFeedbackClick = (feedback: 'like' | 'dislike') => {
    setFeedbackGiven(feedback);
    onFeedback(feedback);
  };
  
  const buttonClass = `p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-deep-purple`;
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  if (feedbackGiven) {
    return (
      <div className={`mt-4 text-center ${size === 'sm' ? 'text-xs' : 'text-sm'} text-brand-muted`}>
        ¡Gracias por tu opinión!
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-4 mt-6 ${size === 'sm' ? 'mt-3' : 'mt-6'}`}>
       <p className={`text-brand-muted font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>¿Te ha gustado?</p>
      <button 
        onClick={() => handleFeedbackClick('like')}
        className={`${buttonClass} text-green-400 hover:bg-green-500/20 focus:ring-green-400`}
        aria-label="Me gusta"
      >
        <ThumbUpIcon className={iconSize} />
      </button>
      <button 
        onClick={() => handleFeedbackClick('dislike')}
        className={`${buttonClass} text-red-400 hover:bg-red-500/20 focus:ring-red-400`}
        aria-label="No me gusta"
      >
        <ThumbDownIcon className={iconSize} />
      </button>
    </div>
  );
};

export default FeedbackWidget;
