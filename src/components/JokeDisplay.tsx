import React from 'react';
import { Card, CardContent, Typography, Rating, Box } from '@mui/material';

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
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {joke.category}
        </Typography>
        <Typography variant="h5" component="div">
          {joke.setup}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {joke.punchline}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Rate this joke:
          </Typography>
          <Rating
            name="joke-rating"
            value={joke.rating}
            precision={0.5}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                onRate(newValue);
              }
            }}
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({joke.ratingCount} votes)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default JokeDisplay;