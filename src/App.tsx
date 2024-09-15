import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { collection, getDocs, query, where, CollectionReference, Query, addDoc, updateDoc, doc, deleteDoc, limit, increment, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { db, auth } from './firebase';
import JokeDisplay from '../src/components/JokeDisplay';
import JokeSubmissionForm from '../src/components/JokeSubmissionForm';
import Auth from '../src/components/Auth';
import UserProfile from '../src/components/UserProfile';
import Leaderboard from '../src/components/Leaderboard';
import JokeSearch from '../src/components/JokeSearch';
import HeroSection from '../src/components/HeroSection';
import NotificationComponent from '../src/components/NotificationComponent';
import LoginPage from '../src/components/LoginPage';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box, FormControl, InputLabel, Select, MenuItem, IconButton, Menu, Divider, Drawer, List, ListItem, ListItemText, ListItemIcon, Avatar, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import { checkAchievements } from './utils/achievementChecker';
import { updateUserLevel } from './utils/userLevelUtils';
import { checkAndUpdateAchievements } from './utils/achievements';
import { createNotification } from './utils/notificationUtils';
import logo from '../src/assets/dad-jokes-logo.png';
import { SelectChangeEvent } from '@mui/material/Select';
import CategoriesPage from '../src/components/CategoriesPage';
import CategoryJokesPage from '../src/components/CategoryJokesPage';
import JokeSubmissionModal from '../src/components/JokeSubmissionModal';
import NotificationSettings from '../src/components/NotificationSettings';
import Footer from './components/Footer';
import SwipeableJokeCard from './components/SwipeableJokeCard';

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
  userId: string;
  createdAt: Date;
}

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#4A90E2',
    },
    secondary: {
      main: '#FFD166',
    },
    background: {
      default: mode === 'light' ? '#F5F7FA' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#FFFFFF',
      secondary: mode === 'light' ? '#666666' : '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 700 },
    h2: { fontSize: '2.5rem', fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [displayedJokes, setDisplayedJokes] = useState<Joke[]>([]);
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null);
  const [jokeOfTheDay, setJokeOfTheDay] = useState<Joke | null>(null);
  const [randomJoke, setRandomJoke] = useState<Joke | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [favoriteJokes, setFavoriteJokes] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showJokeSubmissionModal, setShowJokeSubmissionModal] = useState(false);

  const theme = getTheme(darkMode ? 'dark' : 'light');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchJokes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const jokesCollection = collection(db, 'jokes') as CollectionReference<Joke>;
      let jokesQuery: Query<Joke>;
      if (selectedCategory !== 'all') {
        jokesQuery = query(jokesCollection, where('category', '==', selectedCategory));
      } else {
        jokesQuery = jokesCollection;
      }
      const jokesSnapshot = await getDocs(jokesQuery);
      const jokesList = jokesSnapshot.docs.map(doc => ({ ...(doc.data() as Joke), id: doc.id }));
      setJokes(jokesList);
      
      const shuffled = jokesList.sort(() => 0.5 - Math.random());
      setDisplayedJokes(shuffled.slice(0, 10));

      setCurrentJoke(shuffled[0] || null);
    } catch (err) {
      setError('Failed to fetch jokes. Please try again later.');
      console.error('Error fetching jokes:', err);
    }
    setLoading(false);
  }, [selectedCategory]);

  const fetchFavorites = useCallback(async () => {
    if (user) {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const favoriteIds = querySnapshot.docs.map(doc => doc.data().jokeId);
      setFavoriteJokes(favoriteIds);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await fetchFavorites();
      } else {
        setFavoriteJokes([]);
      }
    });
    fetchJokes();
    return unsubscribe;
  }, [fetchJokes, fetchFavorites]);

  useEffect(() => {
    const fetchJokeOfTheDay = async () => {
      const jokeSnapshot = await getDocs(query(collection(db, 'jokes'), limit(1)));
      if (!jokeSnapshot.empty) {
        const jokeData = jokeSnapshot.docs[0].data() as Joke;
        const { id, ...restOfJokeData } = jokeData;
        setJokeOfTheDay({ id: jokeSnapshot.docs[0].id, ...restOfJokeData });
      }
    };
    fetchJokeOfTheDay();
  }, []);

  const getRandomJokes = useCallback((count: number): Joke[] => {
    return [...jokes]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }, [jokes]);

  useEffect(() => {
    if (jokes.length > 0) {
      setRandomJoke(getRandomJokes(1)[0]);
      if (isMobile) {
        setDisplayedJokes(getRandomJokes(10));
      }
    }
  }, [jokes, isMobile, getRandomJokes]);

  const rateJoke = async (jokeId: string, rating: number) => {
    if (user) {
      const jokeRef = doc(db, 'jokes', jokeId);
      const jokeSnap = await getDoc(jokeRef);
      if (jokeSnap.exists()) {
        const jokeData = jokeSnap.data() as Joke;
        const newRating = (jokeData.rating * jokeData.ratingCount + rating) / (jokeData.ratingCount + 1);
        const newRatingCount = jokeData.ratingCount + 1;
        
        try {
          await updateDoc(jokeRef, { rating: newRating, ratingCount: newRatingCount });
          await updateDoc(doc(db, 'users', user.uid), {
            totalRatings: increment(1)
          });
          await checkAndUpdateAchievements(user.uid, 'ratings');
          const result = await updateUserLevel(jokeData.userId, 'receiveRating');
          console.log('User level updated after receiving rating:', result);

          setJokes(prevJokes => 
            prevJokes.map(joke => 
              joke.id === jokeId 
                ? { ...joke, rating: newRating, ratingCount: newRatingCount } 
                : joke
            )
          );

          if (jokeData.userId !== user.uid) {
            await createNotification(
              jokeData.userId,
              `Your joke "${jokeData.setup.substring(0, 20)}..." received a new rating!`,
              'rating',
              jokeId
            );
          }
        } catch (error) {
          console.error('Error updating joke rating or user level:', error);
        }
      }
    } else {
      alert('Please sign in to rate jokes');
    }
  };

  const toggleFavorite = async (jokeId: string) => {
    if (user) {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.uid), where('jokeId', '==', jokeId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await addDoc(favoritesRef, { userId: user.uid, jokeId });
        setFavoriteJokes([...favoriteJokes, jokeId]);
        await updateDoc(doc(db, 'users', user.uid), {
          totalFavorites: increment(1)
        });
        await checkAndUpdateAchievements(user.uid, 'favorites');
  
        const jokeRef = doc(db, 'jokes', jokeId);
        const jokeDoc = await getDoc(jokeRef);
        if (jokeDoc.exists() && jokeDoc.data().userId !== user.uid) {
          await createNotification(
            jokeDoc.data().userId,
            `Your joke "${jokeDoc.data().setup.substring(0, 20)}..." was favorited!`,
            'achievement',
            jokeId
          );
        }
      } else {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(db, 'favorites', docToDelete.id));
        setFavoriteJokes(favoriteJokes.filter(id => id !== jokeId));
      }
    } else {
      alert('Please sign in to favorite jokes');
    }
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const submitJoke = async (joke: { setup: string; punchline: string; category: string }) => {
    if (user) {
      if (!joke.setup.trim() || !joke.punchline.trim() || !joke.category) {
        alert('Please fill in all fields before submitting a joke.');
        return;
      }
      try {
        const docRef = await addDoc(collection(db, 'jokes'), {
          ...joke,
          userId: user.uid,
          rating: 0,
          ratingCount: 0,
        });
        setShowJokeSubmissionModal(false);
        fetchJokes();
        await updateDoc(doc(db, 'users', user.uid), {
          totalJokes: increment(1)
        });
        await checkAndUpdateAchievements(user.uid, 'jokes');
        const result = await updateUserLevel(user.uid, 'submitJoke');
        console.log('User level updated after submitting joke:', result);

        await createNotification(
          user.uid,
          `Your joke "${joke.setup.substring(0, 20)}..." was successfully submitted!`,
          'achievement',
          docRef.id
        );
      } catch (error) {
        console.error('Error submitting joke or updating user level:', error);
      }
    }
  };

  const handleEmailSignIn = () => {
    fetchJokes();
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value as string);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleSubmitJokeClick = () => {
    setShowJokeSubmissionModal(true);
    setDrawerOpen(false);
  };

  const handleComment = async (jokeId: string, comment: string) => {
    if (user) {
      try {
        await addDoc(collection(db, 'comments'), {
          jokeId,
          userId: user.uid,
          text: comment,
          createdAt: new Date()
        });
        console.log('Comment added successfully');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    } else {
      alert('Please sign in to comment');
    }
  };

  const handleShare = (platform: string, jokeId: string) => {
    const joke = jokes.find(j => j.id === jokeId);
    if (!joke) return;

    const text = `Check out this joke: ${joke.setup} ${joke.punchline}`;
    const url = `https://yourwebsite.com/joke/${jokeId}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Funny Joke&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
  };

  const fetchComments = async (jokeId: string): Promise<Comment[]> => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('jokeId', '==', jokeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
  };

  const handleSwipedAllJokes = () => {
    setDisplayedJokes(getRandomJokes(10));
  };

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {user ? (
        <>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ width: 60, height: 60, bgcolor: 'primary.main', mb: 1 }}
              src={user.photoURL || undefined}
            >
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </Avatar>
            <Typography variant="subtitle1">{user.displayName || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          </Box>
          <Divider />
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component={Link} to="/profile">
              <ListItemIcon><AccountCircle /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button component={Link} to="/categories">
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItem>
            <ListItem button onClick={handleSubmitJokeClick}>
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="Submit a Joke" />
            </ListItem>
            <ListItem button component={Link} to="/leaderboard">
              <ListItemIcon><EmojiEventsIcon /></ListItemIcon>
              <ListItemText primary="Leaderboard" />
            </ListItem>
            <ListItem button onClick={signOut}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      ) : (
        <List>
          <ListItem button onClick={signIn}>
            <ListItemIcon><GoogleIcon /></ListItemIcon>
            <ListItemText primary="Sign in with Google" />
          </ListItem>
          <ListItem button component={Link} to="/login">
            <ListItemIcon><LockOpenIcon /></ListItemIcon>
            <ListItemText primary="Email Login/Signup" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="large" edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
                  <MenuIcon />
                </IconButton>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <img src={logo} alt="Really Funny Dad Jokes" style={{ height: '32px', marginRight: '8px' }} />
                  {!isMobile && (
                    <Typography variant="h6" component="div">
                      Really Funny Dad Jokes
                    </Typography>
                  )}
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {user && <NotificationComponent />}
                <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            {drawerContent}
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1 }}>
            <Container maxWidth="lg">
              <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
                <Routes>
                  <Route path="/" element={
                    <>
                      <HeroSection onGetRandomJoke={getRandomJokes} isMobile={isMobile} />
                      {randomJoke && (
                        <Box sx={{ my: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <Typography variant="h5" gutterBottom>Random Joke</Typography>
                          <JokeDisplay 
                            joke={randomJoke}
                            onRate={(rating) => rateJoke(randomJoke.id, rating)}
                            onToggleFavorite={() => toggleFavorite(randomJoke.id)}
                            isFavorite={favoriteJokes.includes(randomJoke.id)}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4">Today's Top Jokes</Typography>
                        <FormControl sx={{ minWidth: 120 }}>
                          <InputLabel id="category-select-label">Category</InputLabel>
                          <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={selectedCategory}
                            label="Category"
                            onChange={handleCategoryChange}
                          >
                            <MenuItem value="all">All Categories</MenuItem>
                            <MenuItem value="pun">Pun</MenuItem>
                            <MenuItem value="wordplay">Wordplay</MenuItem>
                            <MenuItem value="science">Science</MenuItem>
                            <MenuItem value="animals">Animals</MenuItem>
                            <MenuItem value="food">Food</MenuItem>
                            <MenuItem value="school">School</MenuItem>
                            <MenuItem value="halloween">Halloween</MenuItem>
                            <MenuItem value="sports">Sports</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      
                      {jokeOfTheDay && (
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h5" gutterBottom>Joke of the Day</Typography>
                          <JokeDisplay 
                            joke={jokeOfTheDay} 
                            onRate={(rating) => rateJoke(jokeOfTheDay.id, rating)}
                            onToggleFavorite={() => toggleFavorite(jokeOfTheDay.id)}
                            isFavorite={favoriteJokes.includes(jokeOfTheDay.id)}
                          />
                        </Box>
                      )}

                      {isMobile ? (
                        <SwipeableJokeCard
                          jokes={displayedJokes}
                          onRate={rateJoke}
                          onComment={handleComment}
                          onFavorite={toggleFavorite}
                          isFavorite={(jokeId) => favoriteJokes.includes(jokeId)}
                          onShare={handleShare}
                          fetchComments={fetchComments}
                          onSwipedAllJokes={handleSwipedAllJokes}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                          {displayedJokes.map(joke => (
                            <Box key={joke.id} sx={{ width: '100%' }}>
                              <JokeDisplay 
                                joke={joke} 
                                onRate={(rating) => rateJoke(joke.id, rating)}
                                onToggleFavorite={() => toggleFavorite(joke.id)}
                                isFavorite={favoriteJokes.includes(joke.id)}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}

                      <Button variant="contained" onClick={() => setDisplayedJokes(getRandomJokes(10))} sx={{ mt: 2 }}>
                        Get More Jokes
                      </Button>

                      <Leaderboard />
                      <JokeSearch />
                    </>
                  } />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/profile/:userId" element={<UserProfile />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/category/:categoryName" element={<CategoryJokesPage />} />
                  <Route path="/notification-settings" element={<NotificationSettings />} />
                  <Route path="/login" element={<LoginPage signIn={signIn} />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
              </Box>
            </Container>
          </Box>
          <Footer />
        </Box>
        <JokeSubmissionModal
          open={showJokeSubmissionModal}
          onClose={() => setShowJokeSubmissionModal(false)}
          onSubmit={submitJoke}
        />
      </ThemeProvider>
    </Router>
  );
};

export default App;