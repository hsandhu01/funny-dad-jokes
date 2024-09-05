import React, { useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Paper, 
  Box,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(
    debounce(async (term: string) => {
      console.log("Search term:", term);
      setError(null);
      setIsLoading(true);
      
      if (term.trim() === '') {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        const jokesRef = collection(db, 'jokes');
        const lowercaseSearchTerm = term.toLowerCase();
        console.log("Lowercase search term:", lowercaseSearchTerm);

        let q = query(
          jokesRef,
          where('searchTokens', 'array-contains', lowercaseSearchTerm)
        );

        console.log("Executing query...");
        let querySnapshot = await getDocs(q);
        console.log("Query complete. Number of results:", querySnapshot.size);

        if (querySnapshot.empty) {
          console.log("No results found. Trying less restrictive query...");
          q = query(
            jokesRef,
            where('searchTokens', 'array-contains-any', lowercaseSearchTerm.split(' '))
          );
          querySnapshot = await getDocs(q);
          console.log("Less restrictive query complete. Number of results:", querySnapshot.size);
        }

        if (querySnapshot.empty) {
          console.log("Still no results. Falling back to client-side search...");
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
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Search Jokes</Typography>
      <TextField
        fullWidth
        variant="outlined"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Enter keywords to search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isLoading && <CircularProgress size={20} />}
            </InputAdornment>
          )
        }}
      />
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <List sx={{ mt: 2 }}>
        {searchResults.map((joke) => (
          <ListItem key={joke.id} alignItems="flex-start" divider>
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="div">
                  {joke.setup}
                </Typography>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {joke.punchline}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Rating: ${joke.rating.toFixed(1)}`} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={joke.category} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
      {searchResults.length === 0 && searchTerm !== '' && !isLoading && !error && (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          No jokes found. Try a different search term.
        </Typography>
      )}
    </Paper>
  );
};

export default JokeSearch;