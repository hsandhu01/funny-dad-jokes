import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

const JokeBattle: React.FC = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [leftJoke, setLeftJoke] = useState<Joke | null>(null);
  const [rightJoke, setRightJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleCount, setBattleCount] = useState(0);

  const fetchJokes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching jokes...');
      const jokesRef = collection(db, 'jokes');
      console.log('Jokes collection reference:', jokesRef);
      const jokesQuery = query(jokesRef, limit(100));
      console.log('Jokes query:', jokesQuery);
      const querySnapshot = await getDocs(jokesQuery);
      console.log('Query snapshot:', querySnapshot);
      
      const fetchedJokes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Joke document:', doc.id, data);
        return {
          id: doc.id,
          setup: data.setup,
          punchline: data.punchline,
          category: data.category,
          rating: data.rating,
          ratingCount: data.ratingCount
        } as Joke;
      });
      
      console.log('Fetched jokes:', fetchedJokes);
      setJokes(fetchedJokes);
    } catch (err) {
      console.error('Error fetching jokes:', err);
      setError(`Failed to fetch jokes. Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJokes();
  }, [fetchJokes]);

  const setNewJokes = useCallback(() => {
    if (jokes.length < 2) return;
    const shuffled = [...jokes].sort(() => 0.5 - Math.random());
    setLeftJoke(shuffled[0]);
    setRightJoke(shuffled[1]);
  }, [jokes]);

  useEffect(() => {
    if (jokes.length >= 2) {
      setNewJokes();
    }
  }, [jokes, setNewJokes]);

  const handleVote = (side: 'left' | 'right') => {
    console.log(`Voted for ${side} joke`);
    setBattleCount(prev => prev + 1);
    setNewJokes();
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (jokes.length < 2) {
    return <Typography>Not enough jokes available for a battle. Please add more jokes! (Total jokes: {jokes.length})</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">Joke Battle</Typography>
      <Typography variant="subtitle1" gutterBottom align="center">
        Vote for your favorite joke! Battles fought: {battleCount}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        {leftJoke && (
          <Paper sx={{ width: '45%', p: 2 }}>
            <Typography variant="h6">{leftJoke.setup}</Typography>
            <Typography variant="body1">{leftJoke.punchline}</Typography>
            <Button onClick={() => handleVote('left')} variant="contained" sx={{ mt: 2 }}>
              Vote Left
            </Button>
          </Paper>
        )}
        <Typography variant="h4" sx={{ alignSelf: 'center' }}>VS</Typography>
        {rightJoke && (
          <Paper sx={{ width: '45%', p: 2 }}>
            <Typography variant="h6">{rightJoke.setup}</Typography>
            <Typography variant="body1">{rightJoke.punchline}</Typography>
            <Button onClick={() => handleVote('right')} variant="contained" sx={{ mt: 2 }}>
              Vote Right
            </Button>
          </Paper>
        )}
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button onClick={setNewJokes} variant="outlined">
          New Battle
        </Button>
      </Box>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Total jokes available: {jokes.length}
      </Typography>
    </Box>
  );
};

export default JokeBattle;