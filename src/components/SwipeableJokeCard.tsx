import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Button, TextField, Select, MenuItem, Chip, IconButton } from '@mui/material';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

interface SwipeableJokeCardProps {
  jokes: Joke[];
  onRate: (jokeId: string, rating: number) => void;
  onComment: (jokeId: string, comment: string) => void;
  onFavorite: (jokeId: string) => void;
  isFavorite: (jokeId: string) => boolean;
  onShare: (platform: string, jokeId: string) => void;
}

const SwipeableJokeCard: React.FC<SwipeableJokeCardProps> = ({ 
  jokes, onRate, onComment, onFavorite, isFavorite, onShare 
}) => {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const controls = useAnimation();

  const currentJoke = jokes[currentJokeIndex];

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: "100%", opacity: 0 });
      nextJoke();
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: "-100%", opacity: 0 });
      previousJoke();
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const nextJoke = () => {
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
    resetCard();
  };

  const previousJoke = () => {
    setCurrentJokeIndex((prevIndex) => (prevIndex - 1 + jokes.length) % jokes.length);
    resetCard();
  };

  const resetCard = () => {
    setShowPunchline(false);
    setComment('');
    controls.start({ x: 0, opacity: 1 });
  };

  const handleRevealPunchline = () => {
    setShowPunchline(true);
  };

  const handleReadAloud = () => {
    const utterance = new SpeechSynthesisUtterance(`${currentJoke.setup} ${currentJoke.punchline}`);
    if (selectedVoice) {
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === selectedVoice) || null;
    }
    speechSynthesis.speak(utterance);
  };

  const handleRate = (rating: number) => {
    onRate(currentJoke.id, rating);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onComment(currentJoke.id, comment);
      setComment('');
    }
  };

  const handleFavorite = () => {
    onFavorite(currentJoke.id);
  };

  const handleShare = (platform: string) => {
    onShare(platform, currentJoke.id);
  };

  useEffect(() => {
    resetCard();
  }, [currentJokeIndex]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ opacity: 1, x: 0 }}
    >
      <Card sx={{ maxWidth: '100%', mx: 'auto', my: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip label={currentJoke.category} color="primary" size="small" />
            <Typography variant="body2" color="text.secondary">
              {currentJoke.rating.toFixed(1)} ⭐ ({currentJoke.ratingCount} votes)
            </Typography>
          </Box>
          <Typography variant="h6" component="div" gutterBottom>
            {currentJoke.setup}
          </Typography>
          {showPunchline ? (
            <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
              {currentJoke.punchline}
            </Typography>
          ) : (
            <Button onClick={handleRevealPunchline} variant="outlined" fullWidth sx={{ mt: 2 }}>
              Reveal Punchline
            </Button>
          )}
          <Box sx={{ mt: 2 }}>
            <Select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as string)}
              displayEmpty
              fullWidth
              size="small"
            >
              <MenuItem value="" disabled>Select a voice</MenuItem>
              {speechSynthesis.getVoices().map((voice) => (
                <MenuItem key={voice.name} value={voice.name}>
                  {voice.name}
                </MenuItem>
              ))}
            </Select>
            <Button variant="contained" onClick={handleReadAloud} fullWidth sx={{ mt: 1 }}>
              Read Aloud
            </Button>
          </Box>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Rate this joke:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 1 }}>
            {['😐', '🙂', '😀', '😆', '🤣'].map((emoji, index) => (
              <IconButton key={index} onClick={() => handleRate(index + 1)}>
                {emoji}
              </IconButton>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <IconButton onClick={() => handleShare('facebook')}><FacebookIcon /></IconButton>
            <IconButton onClick={() => handleShare('twitter')}><TwitterIcon /></IconButton>
            <IconButton onClick={() => handleShare('whatsapp')}><WhatsAppIcon /></IconButton>
            <IconButton onClick={() => handleShare('email')}><EmailIcon /></IconButton>
            <IconButton 
              color={isFavorite(currentJoke.id) ? "secondary" : "default"}
              onClick={handleFavorite}
            >
              <FavoriteIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" sx={{ mt: 2 }}>Comments</Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Button variant="contained" onClick={handleCommentSubmit} fullWidth sx={{ mt: 1 }}>
            Post Comment
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
            No comments yet. Be the first to comment!
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwipeableJokeCard;