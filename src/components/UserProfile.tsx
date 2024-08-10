import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Box, Typography, Tabs, Tab, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import JokeDisplay from './JokeDisplay';
import Achievements, { Achievement } from './Achievements';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  userId: string;
}

interface Comment {
  id: string;
  text: string;
  jokeId: string;
  createdAt: Date;
}

const UserProfile: React.FC = () => {
  const [submittedJokes, setSubmittedJokes] = useState<Joke[]>([]);
  const [favoriteJokes, setFavoriteJokes] = useState<Joke[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchUserJokes();
    fetchUserComments();
    fetchAchievements();
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
            where('__name__', 'in', favoriteJokeIds)
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

  const fetchUserComments = async () => {
    if (auth.currentUser) {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const userCommentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Comment));
      setUserComments(userCommentsList);
    }
  };

  const fetchAchievements = async () => {
    if (auth.currentUser) {
      const achievementsRef = collection(db, 'achievements');
      const q = query(achievementsRef, where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const userAchievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
      setAchievements(userAchievements);
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
        <Tab label="Your Comments" />
      </Tabs>
      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          submittedJokes.length > 0 ? (
            submittedJokes.map(joke => (
              <JokeDisplay 
                key={joke.id} 
                joke={joke} 
                onRate={() => {}} 
                onToggleFavorite={() => {}}
                isFavorite={false}
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
                onToggleFavorite={() => {}}
                isFavorite={true}
              />
            ))
          ) : (
            <Typography>You haven't favorited any jokes yet.</Typography>
          )
        )}
        {activeTab === 2 && (
          userComments.length > 0 ? (
            <List>
              {userComments.map((comment) => (
                <ListItem key={comment.id}>
                  <ListItemText
                    primary={comment.text}
                    secondary={`On joke: ${comment.jokeId} - ${comment.createdAt.toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>You haven't made any comments yet.</Typography>
          )
        )}
      </Box>
      <Achievements achievements={achievements} />
    </Box>
  );
};

export default UserProfile;