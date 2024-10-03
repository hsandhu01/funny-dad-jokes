import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useJokes, Joke } from '../contexts/JokeContext';

const JokeBattle: React.FC = () => {
  const { jokes, loading, error } = useJokes();
  const [leftJoke, setLeftJoke] = useState<Joke | null>(null);
  const [rightJoke, setRightJoke] = useState<Joke | null>(null);
  const [winner, setWinner] = useState<'left' | 'right' | null>(null);
  const [battleCount, setBattleCount] = useState(0);

  const getRandomJoke = useCallback(() => {
    if (jokes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * jokes.length);
    return jokes[randomIndex];
  }, [jokes]);

  const setNewJokes = useCallback(() => {
    console.log("setNewJokes called");
    if (jokes.length < 2) {
      console.log("Not enough jokes to start a battle");
      return;
    }
    let newLeft = getRandomJoke();
    let newRight = getRandomJoke();
    while (newRight?.id === newLeft?.id) {
      newRight = getRandomJoke();
    }
    console.log("New jokes:", newLeft, newRight);
    setLeftJoke(newLeft);
    setRightJoke(newRight);
    setWinner(null);
  }, [getRandomJoke, jokes.length]);

  useEffect(() => {
    if (jokes.length >= 2 && (!leftJoke || !rightJoke)) {
      setNewJokes();
    }
  }, [jokes, leftJoke, rightJoke, setNewJokes]);

  const handleVote = (side: 'left' | 'right') => {
    setWinner(side);
    setBattleCount(prev => prev + 1);
  };

  const JokeCard: React.FC<{ joke: Joke | null; side: 'left' | 'right' }> = ({ joke, side }) => {
    if (!joke) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: winner === side ? 'success.light' : 'background.paper'
          }}
        >
          <Typography variant="h6" gutterBottom>{joke.setup}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{joke.punchline}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleVote(side)}
            disabled={winner !== null}
          >
            Vote for this joke
          </Button>
        </Paper>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">Joke Battle</Typography>
      <Typography variant="subtitle1" gutterBottom align="center">
        Vote for your favorite joke! Battles fought: {battleCount}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Box sx={{ width: '45%' }}>
          <AnimatePresence mode="wait">
            <JokeCard key={leftJoke?.id} joke={leftJoke} side="left" />
          </AnimatePresence>
        </Box>
        <Typography variant="h4" sx={{ alignSelf: 'center' }}>VS</Typography>
        <Box sx={{ width: '45%' }}>
          <AnimatePresence mode="wait">
            <JokeCard key={rightJoke?.id} joke={rightJoke} side="right" />
          </AnimatePresence>
        </Box>
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center', padding: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            console.log("New Battle clicked");
            setNewJokes();
          }}
        >
          New Battle
        </Button>
      </Box>
    </Box>
  );
};

export default JokeBattle;