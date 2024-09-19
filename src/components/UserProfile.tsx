import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import JokeDisplay from './JokeDisplay';
import UserLevel from './UserLevel';
import EditProfile from './EditProfile';
import FollowersList from './FollowersList';
import { useSocial } from '../hooks/useSocial';

interface UserData {
  id: string;
  uid: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  favoriteCategory: string;
  profilePictureURL: string;
  level: number;
  experience: number;
  totalJokesSubmitted: number;
  totalRatingsReceived: number;
  totalRatingsGiven: number;
  totalFavoritesReceived: number;
  averageRating: number;
  totalAchievements: number;
}

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
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [submittedJokes, setSubmittedJokes] = useState<Joke[]>([]);
  const [favoriteJokes, setFavoriteJokes] = useState<Joke[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isFollowing, followersCount, followingCount, follow, unfollow } = useSocial(userId || '');

  useEffect(() => {
    const fetchUserData = async () => {
      let uid = userId;
      if (!uid && auth.currentUser) {
        uid = auth.currentUser.uid;
      }
  
      if (uid) {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData({
            ...data,
            id: userDoc.id,
            uid: uid,
          });
          setIsCurrentUser(auth.currentUser?.uid === uid);
          await fetchUserJokes(uid);
          await fetchUserComments(uid);
          await fetchAchievements(uid);
        } else {
          console.error("User document does not exist");
          navigate('/');
        }
      } else {
        console.error("No user ID available");
        navigate('/');
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, [userId, navigate]);

  const fetchUserJokes = async (uid: string) => {
    try {
      const submittedQuery = query(
        collection(db, 'jokes'),
        where('userId', '==', uid)
      );
      const submittedSnapshot = await getDocs(submittedQuery);
      const submittedJokesList = submittedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Joke));
      setSubmittedJokes(submittedJokesList);

      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', uid)
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
  };

  const fetchUserComments = async (uid: string) => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    const userCommentsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Comment));
    setUserComments(userCommentsList);
  };

  const fetchAchievements = async (uid: string) => {
    const achievementsRef = collection(db, 'users', uid, 'achievements');
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
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = (updatedUserData: Partial<UserData>) => {
    setIsEditModalOpen(false);
    setUserData(prevData => prevData ? { ...prevData, ...updatedUserData } : null);
  };

  const handleFollow = async () => {
    if (isFollowing) {
      await unfollow();
    } else {
      await follow();
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

  if (!userData) {
    return <Typography>User not found.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              src={userData.profilePictureURL}
              alt={userData.username}
              sx={{ width: 120, height: 120, mx: 'auto', border: '4px solid', borderColor: 'primary.main' }}
            />
          </Grid>
          <Grid item xs={12} sm>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4">{userData.username}</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>{userData.email}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{userData.bio || "No bio yet"}</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip icon={<EmojiEventsIcon />} label={`Level ${userData.level}`} color="primary" sx={{ mr: 1 }} />
                <Chip label={userData.location || "Location not set"} variant="outlined" sx={{ mr: 1 }} />
                <Chip label={`${followersCount} followers`} variant="outlined" sx={{ mr: 1 }} />
                <Chip label={`${followingCount} following`} variant="outlined" />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {isCurrentUser ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditModalOpen(true)}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                    fullWidth
                  >
                    Notification Settings
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleFollow}
                  fullWidth
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <UserLevel
          level={userData.level}
          experience={userData.experience}
          experienceToNextLevel={(userData.level + 1) * 100}
        />
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom align="center">User Stats</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Jokes Submitted" value={userData.totalJokesSubmitted || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Ratings Received" value={userData.totalRatingsReceived || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Ratings Given" value={userData.totalRatingsGiven || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Favorites Received" value={userData.totalFavoritesReceived || 0} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatItem label="Average Rating" value={(userData.averageRating || 0).toFixed(2)} />
          </Grid>
        </Grid>
      </Paper>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Submitted Jokes" />
        <Tab label="Favorite Jokes" />
        <Tab label="Comments" />
        <Tab label="Achievements" />
        <Tab label="Followers" />
        <Tab label="Following" />
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
            <Typography align="center">No jokes submitted yet.</Typography>
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
            <Typography align="center">No favorite jokes yet.</Typography>
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
            <Typography align="center">No comments made yet.</Typography>
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
            <Typography align="center">No achievements unlocked yet. Keep using the app to earn achievements!</Typography>
          )
        )}
        {activeTab === 4 && (
          <FollowersList userId={userData.uid} type="followers" />
        )}
        {activeTab === 5 && (
          <FollowersList userId={userData.uid} type="following" />
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