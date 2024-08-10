import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
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

const UserProfile: React.FC = () => {
  const [submittedJokes, setSubmittedJokes] = useState<Joke[]>([]);
  const [favoriteJokes, setFavoriteJokes] = useState<Joke[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserJokes();
  }, []);

  const fetchUserJokes = async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        // Fetch submitted jokes
        const submittedQuery = query(
          collection(db, 'jokes'),
          where('userId', '==', auth.currentUser.uid)
        );
        const submittedSnapshot = await getDocs(submittedQuery);
        const submittedJokesList = submittedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Joke));
        setSubmittedJokes(submittedJokesList);

        // Fetch favorite jokes
        const favoritesQuery = query(
          collection(db, 'favorites'),
          where('userId', '==', auth.currentUser.uid)
        );
        const favoritesSnapshot = await getDocs(favoritesQuery);
        const favoriteJokeIds = favoritesSnapshot.docs.map(doc => doc.data().jokeId);

        if (favoriteJokeIds.length > 0) {
          const favoriteJokesQuery = query(
            collection(db, 'jokes'),
            where('__name__', 'in', favoriteJokeIds) // Use __name__ instead of id
          );
          const favoriteJokesSnapshot = await getDocs(favoriteJokesQuery);
          const favoriteJokesList = favoriteJokesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Joke));
          setFavoriteJokes(favoriteJokesList);
        } else {
          setFavoriteJokes([]);
        }
      } catch (error) {
        console.error("Error fetching user jokes:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleFavorite = async (joke: Joke) => {
    if (auth.currentUser) {
      const favoritesRef = collection(db, 'favorites');
      const favoriteQuery = query(
        favoritesRef,
        where('userId', '==', auth.currentUser.uid),
        where('jokeId', '==', joke.id)
      );
      const favoriteSnapshot = await getDocs(favoriteQuery);

      try {
        if (favoriteSnapshot.empty) {
          // Add to favorites
          await addDoc(favoritesRef, {
            userId: auth.currentUser.uid,
            jokeId: joke.id
          });
        } else {
          // Remove from favorites
          const favoriteDoc = favoriteSnapshot.docs[0];
          await deleteDoc(doc(db, 'favorites', favoriteDoc.id));
        }
        // Refresh the jokes lists
        await fetchUserJokes();
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Submitted Jokes" />
        <Tab label="Favorite Jokes" />
      </Tabs>
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          submittedJokes.length > 0 ? (
            submittedJokes.map(joke => (
              <JokeDisplay 
                key={joke.id} 
                joke={joke} 
                onRate={() => {}} 
                onToggleFavorite={() => handleToggleFavorite(joke)}
                isFavorite={favoriteJokes.some(fav => fav.id === joke.id)}
              />
            ))
          ) : (
            <Typography>You haven't submitted any jokes yet.</Typography>
          )
        )}
        {activeTab === 1 && (
          favoriteJokes.length > 0 ? (
            favoriteJokes.map(joke => (
              <JokeDisplay 
                key={joke.id} 
                joke={joke} 
                onRate={() => {}} 
                onToggleFavorite={() => handleToggleFavorite(joke)}
                isFavorite={true}
              />
            ))
          ) : (
            <Typography>You haven't favorited any jokes yet.</Typography>
          )
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;