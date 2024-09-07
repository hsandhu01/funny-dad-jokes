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
  const [selectedVoice, setSelectedVoice] = useState("Microsoft David - English (United States)");

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
        <CardContent sx={{ padding: 6, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            Random Joke
          </Typography>
          <Chip label={currentJoke.category} color="primary" size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ backgroundColor: 'blue', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginBottom: 4 }}>
            {currentJoke.category}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 6 }}>
            {currentJoke.setup}
          </Typography>
          {showPunchline ? (
            <Typography variant="body1" color="text.secondary" sx={{ marginTop: 2, fontStyle: 'italic' }}>
              {currentJoke.punchline}
            </Typography>
          ) : (
            <Button 
              onClick={() => setShowPunchline(true)} 
              sx={{ marginBottom: 6, backgroundColor: 'blue', '&:hover': { backgroundColor: 'darkblue' }, color: 'white' }}
              fullWidth
            >
              Reveal Punchline
            </Button>
          )}

          <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between' }}>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginBottom: 6 }}>
            <Select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} fullWidth>
              <MenuItem value="Microsoft David - English (United States)">Microsoft David - English (United States)</MenuItem>
              {/* Add more voice options here */}
            </Select>
            <Button sx={{ backgroundColor: 'blue', '&:hover': { backgroundColor: 'darkblue' }, color: 'white', width: '100%' }}>
              Read Aloud
            </Button>
          </Box>

          <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
            <IconButton color="primary"><FacebookIcon /></IconButton>
            <IconButton color="primary"><TwitterIcon /></IconButton>
            <IconButton color="primary"><WhatsAppIcon /></IconButton>
            <IconButton color="primary"><EmailIcon /></IconButton>
          </Box>

          <Box sx={{ width: '100%', maxWidth: '500px', marginTop: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Comments</Typography>
            <TextField
              placeholder="Add a comment..."
              variant="outlined"
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button sx={{ backgroundColor: 'blue', '&:hover': { backgroundColor: 'darkblue' }, color: 'white', width: '100%' }} onClick={handleCommentSubmit}>
              Post Comment
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SwipeableJokeCard;