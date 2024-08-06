import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { TextField, Button, List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

const JokeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Joke[]>([]);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;

    const jokesRef = collection(db, 'jokes');
    const q = query(
      jokesRef,
      where('setup', '>=', searchTerm),
      where('setup', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    const jokes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Joke));
    setSearchResults(jokes);
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>Search Jokes</Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter keywords to search"
      />
      <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginTop: '10px' }}>
        Search
      </Button>
      <List>
        {searchResults.map((joke) => (
          <ListItem key={joke.id}>
            <ListItemText
              primary={joke.setup}
              secondary={joke.punchline}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default JokeSearch;