import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Avatar,
  Box,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  userId: string;
}

const Leaderboard: React.FC = () => {
  const [topJokes, setTopJokes] = useState<Joke[]>([]);
  const [expandedJoke, setExpandedJoke] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopJokes = async () => {
      const jokesRef = collection(db, 'jokes');
      const q = query(jokesRef, orderBy('rating', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const jokes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Joke));
      setTopJokes(jokes);
    };

    fetchTopJokes();
  }, []);

  const toggleJokeExpansion = (jokeId: string) => {
    setExpandedJoke(expandedJoke === jokeId ? null : jokeId);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
        Top 10 Jokes
      </Typography>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Joke</TableCell>
              <TableCell align="right">Rating</TableCell>
              <TableCell align="right">Votes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topJokes.map((joke, index) => (
              <React.Fragment key={joke.id}>
                <TableRow 
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    transition: 'background-color 0.3s',
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: index < 3 ? 'secondary.main' : 'primary.main', mr: 1 }}>
                        {index + 1}
                      </Avatar>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" noWrap sx={{ maxWidth: 300 }}>
                      {joke.setup}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={joke.rating.toFixed(1)} 
                      color={index < 3 ? "secondary" : "primary"} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">{joke.ratingCount}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View full joke">
                      <IconButton onClick={() => toggleJokeExpansion(joke.id)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <AnimatePresence>
                  {expandedJoke === joke.id && (
                    <TableRow
                      component={motion.tr}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell colSpan={5}>
                        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="body1" gutterBottom>{joke.setup}</Typography>
                          <Typography variant="body1" color="text.secondary">{joke.punchline}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Leaderboard;