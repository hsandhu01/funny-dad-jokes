import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface JokeSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (joke: { setup: string; punchline: string; category: string }) => Promise<void>;
}

const JokeSubmissionModal: React.FC<JokeSubmissionModalProps> = ({ open, onClose, onSubmit }) => {
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [category, setCategory] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({ setup: false, punchline: false, category: false });

  const validateForm = () => {
    const newErrors = {
      setup: setup.trim() === '',
      punchline: punchline.trim() === '',
      category: category === ''
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onSubmit({ setup, punchline, category });
      setSetup('');
      setPunchline('');
      setCategory('');
      setShowSuccess(true);
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 50 },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h5" component="div" fontWeight="bold">
            Submit a New Joke
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Setup"
              fullWidth
              value={setup}
              onChange={(e) => setSetup(e.target.value)}
              error={errors.setup}
              helperText={errors.setup ? "Setup is required" : ""}
              variant="outlined"
            />
            <TextField
              label="Punchline"
              fullWidth
              value={punchline}
              onChange={(e) => setPunchline(e.target.value)}
              error={errors.punchline}
              helperText={errors.punchline ? "Punchline is required" : ""}
              variant="outlined"
              multiline
              rows={2}
            />
            <FormControl fullWidth error={errors.category}>
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value as string)} label="Category">
                <MenuItem value="pun">Pun</MenuItem>
                <MenuItem value="wordplay">Wordplay</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="animals">Animals</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="school">School</MenuItem>
                <MenuItem value="halloween">Halloween</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
              </Select>
              {errors.category && <Typography color="error" variant="caption">Category is required</Typography>}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{
              px: 4,
              py: 1,
              borderRadius: '20px',
            }}
          >
            Submit Joke
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Joke submitted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default JokeSubmissionModal;