import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Grid, 
  Paper, 
  Avatar, 
  Button, 
  Container, 
  List, 
  ListItem, 
  ListItemText, 
  Modal,
  Chip,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import JokeDisplay from './JokeDisplay';
import UserLevel from './UserLevel';
import EditProfile from './EditProfile';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        const userAchievements = snapshot.docs.map(doc => ({
          ...doc.data(),
          unlockedAt: doc.data().unlockedAt?.toDate()
        } as Achievement));
        setAchievements(userAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = (updatedUserData: Partial<UserData>) => {
    setIsEditModalOpen(false);
    const currentUser = auth.currentUser;
    if (currentUser) {
      const fetchUpdatedUserData = async () => {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data() as UserData, ...updatedUserData });
        }
      };
      fetchUpdatedUserData();
    } else {
      console.error("No authenticated user found when trying to update profile");
    }
  };

  const StatItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <Box textAlign="center" p={2}>
      <Typography variant="h4" color="primary">{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              src={userData?.profilePictureURL}
              alt={userData?.username}
              sx={{ width: 120, height: 120, mx: 'auto', border: '4px solid', borderColor: 'primary.main' }}
            />
          </Grid>
          <Grid item xs={12} sm>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4">{userData?.username}</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>{userData?.email}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{userData?.bio || "No bio yet"}</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip icon={<EmojiEventsIcon />} label={`Level ${userData?.level}`} color="primary" sx={{ mr: 1 }} />
                <Chip label={userData?.location || "Location not set"} variant="outlined" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditModalOpen(true)}
                fullWidth
              >
                Edit Profile
              </Button>
              <Button
                component={Link}
                to="/notification-settings"
                variant="outlined"
                startIcon={<NotificationsIcon />}
                fullWidth
              >
                Notification Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {userData && (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
          <UserLevel
            level={userData.level}
            experience={userData.experience}
            experienceToNextLevel={(userData.level + 1) * 100}
          />
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom align="center">User Stats</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Jokes Submitted" value={userData?.totalJokesSubmitted || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Ratings Received" value={userData?.totalRatingsReceived || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Ratings Given" value={userData?.totalRatingsGiven || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Favorites Received" value={userData?.totalFavoritesReceived || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Average Rating" value={(userData?.averageRating || 0).toFixed(2)} />
          </Grid>
        </Grid>
      </Paper>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        centered 
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Submitted Jokes" />
        <Tab label="Favorite Jokes" />
        <Tab label="Your Comments" />
        <Tab label="Achievements" />
      </Tabs>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        {activeTab === 0 && (
          submittedJokes.length > 0 ? (
            submittedJokes.map(joke => (
              <Box key={joke.id} sx={{ mb: 2 }}>
                <JokeDisplay 
                  joke={joke} 
                  onRate={() => {}} 
                  onToggleFavorite={() => {}}
                  isFavorite={false}
                />
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          ) : (
            <Typography align="center">You haven't submitted any jokes yet.</Typography>
          )
        )}
        {activeTab === 1 && (
          favoriteJokes.length > 0 ? (
            favoriteJokes.map(joke => (
              <Box key={joke.id} sx={{ mb: 2 }}>
                <JokeDisplay 
                  joke={joke} 
                  onRate={() => {}} 
                  onToggleFavorite={() => {}}
                  isFavorite={true}
                />
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          ) : (
            <Typography align="center">You haven't favorited any jokes yet.</Typography>
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
            <Typography align="center">You haven't made any comments yet.</Typography>
          )
        )}
        {activeTab === 3 && (
          achievements.length > 0 ? (
            <Grid container spacing={2}>
              {achievements.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6">{achievement.name}</Typography>
                      <Typography variant="body2">{achievement.description}</Typography>
                    </Box>
                    <Box>
                      <Box component="span" sx={{ fontSize: 48, mt: 1 }}>{achievement.icon}</Box>
                      <Typography variant="caption" display="block">
                        Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography align="center">You haven't unlocked any achievements yet. Keep using the app to earn achievements!</Typography>
          )
        )}
      </Paper>

      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        aria-labelledby="edit-profile-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          {userData && (
            <EditProfile userData={userData} onUpdate={handleProfileUpdate} />
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default UserProfile;