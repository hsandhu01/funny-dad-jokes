import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Container, Grid, Card, CardContent, CardActions, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
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

const JokeCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

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
      await updateDoc(winnerRef, { wins: increment(1) });

      // Update loser
      const loserRef = doc(db, 'jokes', loser.id);
      await updateDoc(loserRef, { losses: increment(1) });

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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (jokes.length < 2) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Not enough jokes available for a battle. Please add more jokes!</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Joke Battle
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Vote for your favorite joke! Battles fought: {battleCount}
      </Typography>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mt: 4 }}>
        {leftJoke && rightJoke && (
          <>
            <Grid item xs={12} md={5}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <JokeCard>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>{leftJoke.setup}</Typography>
                    <Typography variant="body1">{leftJoke.punchline}</Typography>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="caption">
                      Wins: {leftJoke.wins} | Losses: {leftJoke.losses}
                    </Typography>
                    <Button
                      onClick={() => handleVote('left')}
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      Vote Left
                    </Button>
                  </CardActions>
                </JokeCard>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>VS</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <JokeCard>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>{rightJoke.setup}</Typography>
                    <Typography variant="body1">{rightJoke.punchline}</Typography>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Typography variant="caption">
                      Wins: {rightJoke.wins} | Losses: {rightJoke.losses}
                    </Typography>
                    <Button
                      onClick={() => handleVote('right')}
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      Vote Right
                    </Button>
                  </CardActions>
                </JokeCard>
              </motion.div>
            </Grid>
          </>
        )}
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button onClick={setNewJokes} variant="outlined" size="large">
          New Battle
        </Button>
      </Box>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Total jokes available: {jokes.length}
      </Typography>
    </Container>
  );
};

export default JokeBattle;