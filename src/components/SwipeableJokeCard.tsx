import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Button, TextField, Select, MenuItem, Chip } from '@mui/material';
import { motion, PanInfo } from 'framer-motion';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

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
  onLike: (jokeId: string) => void;
  onDislike: (jokeId: string) => void;
  onFavorite: (jokeId: string) => void;
  onRate: (jokeId: string, rating: number) => void;
  onComment: (jokeId: string, comment: string) => void;
  isFavorite: (jokeId: string) => boolean;
}

const SwipeableJokeCard: React.FC<SwipeableJokeCardProps> = ({ 
  jokes, onLike, onDislike, onFavorite, onRate, onComment, isFavorite 
}) => {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');

  const currentJoke = jokes[currentJokeIndex];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleLike();
    } else if (info.offset.x < -100) {
      handleDislike();
    }
  };

  const handleLike = () => {
    onLike(currentJoke.id);
    nextJoke();
  };

  const handleDislike = () => {
    onDislike(currentJoke.id);
    nextJoke();
  };

  const handleFavorite = () => {
    onFavorite(currentJoke.id);
  };

  const nextJoke = () => {
    setCurrentJokeIndex((prevIndex) => (prevIndex + 1) % jokes.length);
    setShowPunchline(false);
    setComment('');
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

  const readAloud = () => {
    const utterance = new SpeechSynthesisUtterance(`${currentJoke.setup} ${currentJoke.punchline}`);
    if (selectedVoice) {
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === selectedVoice) || null;
    }
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <Card sx={{ maxWidth: '100%', mx: 'auto', my: 2, borderRadius: 4, boxShadow: 3 }}>
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
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              {currentJoke.punchline}
            </Typography>
          ) : (
            <Button 
              onClick={() => setShowPunchline(true)} 
              variant="outlined" 
              fullWidth
              sx={{ mt: 2 }}
            >
              Reveal Punchline
            </Button>
          )}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <IconButton onClick={handleDislike} color="error">
              <ThumbDownIcon />
            </IconButton>
            <IconButton onClick={handleFavorite} color={isFavorite(currentJoke.id) ? "secondary" : "default"}>
              <FavoriteIcon />
            </IconButton>
            <IconButton onClick={handleLike} color="success">
              <ThumbUpIcon />
            </IconButton>
            <IconButton onClick={readAloud} color="primary">
              <VolumeUpIcon />
            </IconButton>
            <IconButton color="primary">
              <ShareIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleCommentSubmit}>
                    <CommentIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <IconButton color="primary"><FacebookIcon /></IconButton>
            <IconButton color="primary"><TwitterIcon /></IconButton>
            <IconButton color="primary"><WhatsAppIcon /></IconButton>
            <IconButton color="primary"><EmailIcon /></IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwipeableJokeCard;