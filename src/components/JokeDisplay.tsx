import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Snackbar, Grow, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, EmailShareButton } from 'react-share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import VoiceReader from './VoiceReader';
import CommentSection from './CommentSection';

interface JokeDisplayProps {
  joke: {
    id: string;
    setup: string;
    punchline: string;
    category: string;
    rating: number;
    ratingCount: number;
    userId: string;
  };
  onRate: (rating: number) => void;
  onToggleFavorite: (jokeId: string) => void;
  isFavorite: boolean;
  onDelete?: () => void;
}

const emojis = [
  { emoji: '😐', rating: 1, label: 'Meh' },
  { emoji: '🙂', rating: 2, label: 'Okay' },
  { emoji: '😀', rating: 3, label: 'Good' },
  { emoji: '😆', rating: 4, label: 'Great' },
  { emoji: '🤣', rating: 5, label: 'Hilarious' },
];

const JokeDisplay: React.FC<JokeDisplayProps> = ({ joke, onRate, onToggleFavorite, isFavorite, onDelete }) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPunchline, setShowPunchline] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const shareUrl = `${window.location.origin}/joke/${joke.id}`;
  const shareTitle = `Check out this dad joke: ${joke.setup}`;

  const handleRate = (rating: number) => {
    if (userRating === null) {
      setUserRating(rating);
      onRate(rating);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={joke.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          elevation={3} 
          sx={{ 
            mb: 3, 
            width: '100%', 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff',
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ position: 'relative', pb: 4 }}>
            <Chip 
              label={joke.category} 
              color="primary" 
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: -12, 
                left: 16, 
                fontWeight: 'bold',
                boxShadow: 2
              }} 
            />
            <Typography variant="h5" component="div" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
              {joke.setup}
            </Typography>
            <AnimatePresence>
              {showPunchline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                    {joke.punchline}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
            {!showPunchline && (
              <Button 
                onClick={() => setShowPunchline(true)} 
                variant="outlined" 
                color="primary"
                sx={{ mt: 2, mb: 2 }}
              >
                Reveal Punchline
              </Button>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <VoiceReader text={`${joke.setup} ${joke.punchline}`} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Rate this joke:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {emojis.map((emojiData) => (
                  <motion.div
                    key={emojiData.rating}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      onClick={() => handleRate(emojiData.rating)}
                      variant="outlined"
                      sx={{ 
                        minWidth: 'auto', 
                        fontSize: '1.5rem',
                        p: 1,
                        borderRadius: '50%',
                        borderColor: userRating === emojiData.rating ? 'primary.main' : 'divider',
                        opacity: userRating !== null && userRating !== emojiData.rating ? 0.5 : 1,
                      }}
                      disabled={userRating !== null}
                      title={emojiData.label}
                    >
                      {emojiData.emoji}
                    </Button>
                  </motion.div>
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
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  onClick={() => onToggleFavorite(joke.id)} 
                  color="primary" 
                  aria-label="toggle favorite"
                  sx={{ 
                    bgcolor: isFavorite ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: isFavorite ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </motion.div>
            </Box>
            {onDelete && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => setOpenDeleteDialog(true)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
            <CommentSection jokeId={joke.id} />
          </CardContent>
        </Card>
        
        {onDelete && (
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Delete this joke?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this joke? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                onDelete();
                setOpenDeleteDialog(false);
              }} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Snackbar
          open={showFeedback}
          autoHideDuration={3000}
          onClose={() => setShowFeedback(false)}
          message="Thank you for rating this joke!"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default JokeDisplay;