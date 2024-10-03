import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Typography, Box, CircularProgress } from '@mui/material';
import JokeDisplay from './JokeDisplay';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  userId: string;
}

const CategoryJokesPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJokes = async () => {
      const jokesRef = collection(db, 'jokes');
      const q = query(jokesRef, where('category', '==', categoryName));
      const snapshot = await getDocs(q);
      const jokesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Joke));
      setJokes(jokesList);
      setLoading(false);
    };

    fetchJokes();
  }, [categoryName]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {categoryName} Jokes
      </Typography>
      {jokes.map((joke) => (
        <JokeDisplay
          key={joke.id}
          joke={joke}
          onRate={() => {}} // Implement rating functionality
          onToggleFavorite={() => {}} // Implement favorite functionality
          isFavorite={false} // Implement check for favorite status
        />
      ))}
    </Box>
  );
};

export default CategoryJokesPage;