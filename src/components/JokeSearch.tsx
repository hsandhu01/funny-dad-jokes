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
  searchTokens?: string[];
}

const JokeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Joke[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    console.log("Search term:", searchTerm);
    setError(null);
    
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const jokesRef = collection(db, 'jokes');
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      console.log("Lowercase search term:", lowercaseSearchTerm);

      // Try the original query first
      let q = query(
        jokesRef,
        where('searchTokens', 'array-contains', lowercaseSearchTerm)
      );

      console.log("Executing query...");
      let querySnapshot = await getDocs(q);
      console.log("Query complete. Number of results:", querySnapshot.size);

      if (querySnapshot.empty) {
        console.log("No results found. Trying less restrictive query...");
        // If no results, try a less restrictive query
        q = query(
          jokesRef,
          where('searchTokens', 'array-contains-any', lowercaseSearchTerm.split(' '))
        );
        querySnapshot = await getDocs(q);
        console.log("Less restrictive query complete. Number of results:", querySnapshot.size);
      }

      if (querySnapshot.empty) {
        console.log("Still no results. Falling back to client-side search...");
        // If still no results, fall back to client-side search
        const allJokesSnapshot = await getDocs(jokesRef);
        const allJokes = allJokesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Joke));
        
        const jokes = allJokes.filter(joke => 
          joke.setup.toLowerCase().includes(lowercaseSearchTerm) || 
          joke.punchline.toLowerCase().includes(lowercaseSearchTerm)
        );
        console.log("Client-side search complete. Number of results:", jokes.length);
        setSearchResults(jokes);
      } else {
        const jokes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Joke));
        console.log("Processed jokes:", jokes);
        setSearchResults(jokes);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setError("An error occurred while searching. Please try again.");
    }
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
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSearch} 
        style={{ marginTop: '10px' }}
      >
        Search
      </Button>
      {error && (
        <Typography color="error" style={{ marginTop: '10px' }}>
          {error}
        </Typography>
      )}
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
      {searchResults.length === 0 && searchTerm !== '' && !error && (
        <Typography style={{ marginTop: '10px' }}>
          No jokes found. Try a different search term.
        </Typography>
      )}
    </Paper>
  );
};

export default JokeSearch;