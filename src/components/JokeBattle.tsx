import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { collection, getDocs, query, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  wins: number;
  losses: number;
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
      const jokesRef = collection(db, 'jokes');
      const jokesQuery = query(jokesRef, limit(100));
      const querySnapshot = await getDocs(jokesQuery);
      
      const fetchedJokes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        wins: doc.data().wins || 0,
        losses: doc.data().losses || 0
      } as Joke));
      
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

  const handleVote = async (side: 'left' | 'right') => {
    if (!leftJoke || !rightJoke) return;

    const winner = side === 'left' ? leftJoke : rightJoke;
    const loser = side === 'left' ? rightJoke : leftJoke;

    try {
      // Update winner
      const winnerRef = doc(db, 'jokes', winner.id);
      await updateDoc(winnerRef, {
        wins: increment(1)
      });

      // Update loser
      const loserRef = doc(db, 'jokes', loser.id);
      await updateDoc(loserRef, {
        losses: increment(1)
      });

      // Update local state
      setJokes(jokes.map(joke => 
        joke.id === winner.id ? { ...joke, wins: joke.wins + 1 } :
        joke.id === loser.id ? { ...joke, losses: joke.losses + 1 } :
        joke
      ));

      setBattleCount(prev => prev + 1);
      setNewJokes();
    } catch (err) {
      console.error('Error updating joke win/loss:', err);
      setError(`Failed to update joke win/loss. Error: ${err instanceof Error ? err.message : String(err)}`);
    }
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
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Wins: {leftJoke.wins} | Losses: {leftJoke.losses}
            </Typography>
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
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Wins: {rightJoke.wins} | Losses: {rightJoke.losses}
            </Typography>
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