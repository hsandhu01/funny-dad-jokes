import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, EmailShareButton } from 'react-share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

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
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

const emojis = [
  { emoji: '😐', rating: 1, label: 'Meh' },
  { emoji: '🙂', rating: 2, label: 'Okay' },
  { emoji: '😄', rating: 3, label: 'Good' },
  { emoji: '😆', rating: 4, label: 'Great' },
  { emoji: '🤣', rating: 5, label: 'Hilarious' },
];

const JokeDisplay: React.FC<JokeDisplayProps> = ({ joke, onRate, onToggleFavorite, isFavorite }) => {
  const shareUrl = `${window.location.origin}/joke/${joke.id}`;
  const shareTitle = `Check out this dad joke: ${joke.setup}`;

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
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 2 }}>
              {joke.ratingCount} votes • Average: {joke.rating.toFixed(1)}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <FacebookShareButton url={shareUrl} title={shareTitle}>
                <IconButton color="primary" aria-label="share on facebook">
                  <FacebookIcon />
                </IconButton>
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={shareTitle}>
                <IconButton color="primary" aria-label="share on twitter">
                  <TwitterIcon />
                </IconButton>
              </TwitterShareButton>
              <WhatsappShareButton url={shareUrl} title={shareTitle}>
                <IconButton color="primary" aria-label="share on whatsapp">
                  <WhatsAppIcon />
                </IconButton>
              </WhatsappShareButton>
              <EmailShareButton url={shareUrl} subject="Funny Dad Joke" body={shareTitle}>
                <IconButton color="primary" aria-label="share via email">
                  <EmailIcon />
                </IconButton>
              </EmailShareButton>
              <IconButton onClick={onToggleFavorite} color="primary" aria-label="toggle favorite">
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default JokeDisplay;