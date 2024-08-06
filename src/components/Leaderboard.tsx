import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

const Leaderboard: React.FC = () => {
  const [topJokes, setTopJokes] = useState<Joke[]>([]);

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

  return (
    <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>Top 10 Jokes</Typography>
      <List>
        {topJokes.map((joke, index) => (
          <ListItem key={joke.id}>
            <ListItemText
              primary={`${index + 1}. ${joke.setup}`}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="textPrimary">
                    {joke.punchline}
                  </Typography>
                  {` - Rating: ${joke.rating.toFixed(1)} (${joke.ratingCount} votes)`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Leaderboard;