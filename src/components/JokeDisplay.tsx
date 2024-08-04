import React from 'react';

interface JokeDisplayProps {
  joke: {
    id: string;
    setup: string;
    punchline: string;
    category: string;
    rating: number;
    ratingCount: number;
  };
  onRate: (rating: number) => void;
}

const JokeDisplay: React.FC<JokeDisplayProps> = ({ joke, onRate }) => {
  return (
    <div className="joke-container">
      <span className="category-tag">{joke.category}</span>
      <h2>{joke.setup}</h2>
      <p>{joke.punchline}</p>
      <p>Average Rating: {joke.rating.toFixed(1)} ({joke.ratingCount} votes)</p>
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => onRate(star)}>
            {star} ⭐
          </button>
        ))}
      </div>
    </div>
  );
};

export default JokeDisplay;