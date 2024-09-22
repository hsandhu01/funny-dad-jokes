import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, Typography, Box, Button, TextField, Select, MenuItem, Chip, IconButton, Snackbar } from '@mui/material';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt: Date;
}

interface SwipeableJokeCardProps {
  jokes: Joke[];
  onRate: (jokeId: string, rating: number) => void;
  onComment: (jokeId: string, comment: string) => void;
  onFavorite: (jokeId: string) => void;
  isFavorite: (jokeId: string) => boolean;
  onShare: (platform: string, jokeId: string) => void;
  fetchComments: (jokeId: string) => Promise<Comment[]>;
  onSwipedAllJokes: () => void;
}

const SwipeableJokeCard: React.FC<SwipeableJokeCardProps> = memo(({ 
  jokes, onRate, onComment, onFavorite, isFavorite, onShare, fetchComments, onSwipedAllJokes
}) => {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const controls = useAnimation();

  const currentJoke = jokes[currentJokeIndex];

  const loadComments = useCallback(async () => {
    if (currentJoke) {
      const fetchedComments = await fetchComments(currentJoke.id);
      setComments(fetchedComments);
    }
  }, [currentJoke, fetchComments]);

  useEffect(() => {
    loadComments();
    setShowPunchline(false);
  }, [currentJoke, loadComments]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: "100%", opacity: 0, rotate: 10, transition: { duration: 0.3 } });
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: "-100%", opacity: 0, rotate: -10, transition: { duration: 0.3 } });
      handleSwipe('left');
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for feedback
    }
    if (direction === 'right') {
      nextJoke();
    } else {
      previousJoke();
    }
  };

  const nextJoke = () => {
    if (currentJokeIndex < jokes.length - 1) {
      setCurrentJokeIndex(prevIndex => prevIndex + 1);
    } else {
      onSwipedAllJokes();
      setCurrentJokeIndex(0);
    }
    resetCard();
  };

  const previousJoke = () => {
    if (currentJokeIndex > 0) {
      setCurrentJokeIndex(prevIndex => prevIndex - 1);
    } else {
      setCurrentJokeIndex(jokes.length - 1);
    }
    resetCard();
  };

  const resetCard = () => {
    setShowPunchline(false);
    setComment('');
    controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
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
    setSnackbarMessage(`You rated this joke ${rating} stars!`);
    setSnackbarOpen(true);
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      await onComment(currentJoke.id, comment);
      setComment('');
      setSnackbarMessage('Your comment has been submitted!');
      setSnackbarOpen(true);
      loadComments();
    }
  };

  const handleFavorite = () => {
    onFavorite(currentJoke.id);
    setSnackbarMessage(isFavorite(currentJoke.id) ? 'Joke removed from favorites' : 'Joke added to favorites');
    setSnackbarOpen(true);
  };

  const handleShare = (platform: string) => {
    onShare(platform, currentJoke.id);
    setSnackbarMessage(`Shared on ${platform}`);
    setSnackbarOpen(true);
  };

  const handleDoubleTap = () => {
    handleFavorite();
    if ('vibrate' in navigator) {
      navigator.vibrate(200); // Longer vibration for double-tap
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ opacity: 1, x: 0 }}
      style={{ 
        width: '100%', 
        height: '100%', 
        perspective: 1000 
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d'
        }}
        animate={{
          rotateY: 0,
          scale: 1,
          opacity: 1
        }}
        whileDrag={{
          cursor: 'grabbing',
          scale: 1.05,
          boxShadow: "0px 10px 25px rgba(0,0,0,0.1)"
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        onDoubleClick={handleDoubleTap}
      >
        <Card sx={{ maxWidth: '100%', mx: 'auto', my: 2, boxShadow: 3, position: 'relative', overflow: 'visible' }} className="joke-card">
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
                <IconButton key={index} onClick={() => handleRate(index + 1)} className="rate-button">
                  {emoji}
                </IconButton>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton onClick={() => handleShare('facebook')}><FacebookIcon /></IconButton>
              <IconButton onClick={() => handleShare('twitter')}><TwitterIcon /></IconButton>
              <IconButton onClick={() => handleShare('whatsapp')}><WhatsAppIcon /></IconButton>
              <IconButton onClick={() => handleShare('email')}><EmailIcon /></IconButton>
              <IconButton onClick={handleFavorite}>
                {isFavorite(currentJoke.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
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
            <Box sx={{ mt: 2 }}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2">{comment.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '50%',
          right: -20,
          transform: 'translateY(-50%)',
        }}
      >
        <ArrowForwardIosIcon color="action" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: -20,
          transform: 'translateY(-50%)',
        }}
      >
        <ArrowBackIosIcon color="action" />
      </motion.div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </motion.div>
  );
});

export default SwipeableJokeCard;