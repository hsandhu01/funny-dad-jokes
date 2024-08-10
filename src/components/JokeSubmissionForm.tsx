import React, { useState } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';


interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  userId: string;
}

interface JokeSubmissionFormProps {
  onSubmit: (joke: Omit<Joke, 'id' | 'rating' | 'ratingCount' | 'userId'>) => Promise<void>;
}

const JokeSubmissionForm: React.FC<JokeSubmissionFormProps> = ({ onSubmit }) => {
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ setup, punchline, category });
    setSetup('');
    setPunchline('');
    setCategory('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit a New Joke
      </Typography>
      <TextField
        fullWidth
        label="Setup"
        value={setup}
        onChange={(e) => setSetup(e.target.value)}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="Punchline"
        value={punchline}
        onChange={(e) => setPunchline(e.target.value)}
        required
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          value={category}
          label="Category"
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <MenuItem value="pun">Pun</MenuItem>
          <MenuItem value="wordplay">Wordplay</MenuItem>
          <MenuItem value="science">Science</MenuItem>
          <MenuItem value="animals">Animals</MenuItem>
          <MenuItem value="food">Food</MenuItem>
          <MenuItem value="school">School</MenuItem>
          <MenuItem value="halloween">Halloween</MenuItem>
          <MenuItem value="sports">Sports</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Submit Joke
      </Button>
    </Box>
  );
};

export default JokeSubmissionForm;