import React, { useState, useEffect } from 'react';
import './AnimatedJokeDisplay.css';

interface AnimatedJokeProps {
  setup: string;
  punchline: string;
  category: string;
  onRate: (rating: number) => void;
}

const AnimatedJokeDisplay: React.FC<AnimatedJokeProps> = ({ setup, punchline, category, onRate }) => {
  const [showPunchline, setShowPunchline] = useState(false);

  useEffect(() => {
    setShowPunchline(false);
    const timer = setTimeout(() => setShowPunchline(true), 2000);
    return () => clearTimeout(timer);
  }, [setup, punchline]);

  return (
    <div className="animated-joke-container">
      <div className="joke-card">
        <span className="category-tag">{category}</span>
        <h2 className="setup">{setup}</h2>
        <p className={`punchline ${showPunchline ? 'visible' : ''}`}>{punchline}</p>
        <div className="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} onClick={() => onRate(star)} className="star">
              {star <= 3 ? '😐' : star === 4 ? '😄' : '🤣'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedJokeDisplay;