import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Box, Typography, Tabs, Tab, CircularProgress, List, ListItem, ListItemText, Grid, Paper } from '@mui/material';
import JokeDisplay from './JokeDisplay';
import UserLevel from './UserLevel';
import { UserData } from '../utils/userUtils';

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

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

const UserProfile: React.FC = () => {
  const [submittedJokes, setSubmittedJokes] = useState<Joke[]>([]);
  const [favoriteJokes, setFavoriteJokes] = useState<Joke[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }

        await fetchUserJokes();
        await fetchUserComments();
        await fetchAchievements();
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const fetchUserJokes = async () => {
    if (auth.currentUser) {
      try {
        const submittedQuery = query(
          collection(db, 'jokes'),
          where('userId', '==', auth.currentUser.uid)
        );
        const submittedSnapshot = await getDocs(submittedQuery);
        const submittedJokesList = submittedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Joke));
        setSubmittedJokes(submittedJokesList);

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
      const achievementsRef = collection(db, 'users', auth.currentUser.uid, 'achievements');
      try {
        const snapshot = await getDocs(achievementsRef);
        console.log(`Fetched ${snapshot.docs.length} achievements`);
        const userAchievements = snapshot.docs.map(doc => ({
          ...doc.data(),
          unlockedAt: doc.data().unlockedAt?.toDate()
        } as Achievement));
        setAchievements(userAchievements);
        console.log('Fetched achievements:', userAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
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
      {userData && (
        <UserLevel
          level={userData.level}
          experience={userData.experience}
          experienceToNextLevel={(userData.level + 1) * 100}
        />
      )}
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Submitted Jokes" />
        <Tab label="Favorite Jokes" />
        <Tab label="Your Comments" />
        <Tab label="Achievements" />
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
        {activeTab === 3 && (
          achievements.length > 0 ? (
            <Grid container spacing={2}>
              {achievements.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{achievement.name}</Typography>
                    <Typography variant="body2">{achievement.description}</Typography>
                    <Box component="span" sx={{ fontSize: 48, mt: 1 }}>{achievement.icon}</Box>
                    <Typography variant="caption" display="block">
                      Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>You haven't unlocked any achievements yet. Keep using the app to earn achievements!</Typography>
          )
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;