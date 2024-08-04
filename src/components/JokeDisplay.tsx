import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

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

const emojis = [
  { emoji: '😐', rating: 1, label: 'Meh' },
  { emoji: '🙂', rating: 2, label: 'Okay' },
  { emoji: '😄', rating: 3, label: 'Good' },
  { emoji: '😆', rating: 4, label: 'Great' },
  { emoji: '🤣', rating: 5, label: 'Hilarious' },
];

const JokeDisplay: React.FC<JokeDisplayProps> = ({ joke, onRate }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={joke.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Chip label={joke.category} color="primary" size="small" sx={{ mb: 2 }} />
            <Typography variant="h5" component="div" gutterBottom>
              {joke.setup}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {joke.punchline}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rate this joke:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {emojis.map((emojiData) => (
                  <Button
                    key={emojiData.rating}
                    onClick={() => onRate(emojiData.rating)}
                    variant="outlined"
                    sx={{ 
                      minWidth: 'auto', 
                      fontSize: '1.5rem',
                      p: 1,
                      borderRadius: '50%',
                      borderColor: joke.rating === emojiData.rating ? 'primary.main' : 'divider'
                    }}
                    title={emojiData.label}
                  >
                    {emojiData.emoji}
                  </Button>
                ))}
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {joke.ratingCount} votes • Average: {joke.rating.toFixed(1)}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default JokeDisplay;