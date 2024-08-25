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
  Alert
} from '@mui/material';

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
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Submit a New Joke</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Setup"
            fullWidth
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
            error={errors.setup}
            helperText={errors.setup ? "Setup is required" : ""}
          />
          <TextField
            margin="dense"
            label="Punchline"
            fullWidth
            value={punchline}
            onChange={(e) => setPunchline(e.target.value)}
            error={errors.punchline}
            helperText={errors.punchline ? "Punchline is required" : ""}
          />
          <FormControl fullWidth margin="dense" error={errors.category}>
            <InputLabel>Category</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value as string)}>
              <MenuItem value="pun">Pun</MenuItem>
              <MenuItem value="wordplay">Wordplay</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="animals">Animals</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="school">School</MenuItem>
              <MenuItem value="halloween">Halloween</MenuItem>
              <MenuItem value="sports">Sports</MenuItem>
            </Select>
            {errors.category && <span style={{ color: 'red', fontSize: '0.75rem' }}>Category is required</span>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
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