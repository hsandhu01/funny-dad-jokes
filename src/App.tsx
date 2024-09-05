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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box, FormControl, InputLabel, Select, MenuItem, IconButton, Menu, Divider, Drawer, List, ListItem, ListItemText, ListItemIcon, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
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

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  userId: string;
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
      setDisplayedJokes(shuffled.slice(0, 5));

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

  const getRandomJoke = useCallback(() => {
    if (jokes.length > 0) {
      const randomIndex = Math.floor(Math.random() * jokes.length);
      const newJoke = jokes[randomIndex];
      setRandomJoke(newJoke);
    }
  }, [jokes]);

  useEffect(() => {
    if (jokes.length > 0 && !randomJoke) {
      getRandomJoke();
    }
  }, [jokes, getRandomJoke, randomJoke]);

  const rateJoke = async (rating: number) => {
    if (currentJoke && user) {
      const jokeRef = doc(db, 'jokes', currentJoke.id);
      const newRating = (currentJoke.rating * currentJoke.ratingCount + rating) / (currentJoke.ratingCount + 1);
      const newRatingCount = currentJoke.ratingCount + 1;
      
      try {
        await updateDoc(jokeRef, { rating: newRating, ratingCount: newRatingCount });
        setCurrentJoke({ ...currentJoke, rating: newRating, ratingCount: newRatingCount });
        await updateDoc(doc(db, 'users', user.uid), {
          totalRatings: increment(1)
        });
        await checkAndUpdateAchievements(user.uid, 'ratings');
        const result = await updateUserLevel(currentJoke.userId, 'receiveRating');
        console.log('User level updated after receiving rating:', result);

        // Create notification for joke creator
        if (currentJoke.userId !== user.uid) {
          await createNotification(
            currentJoke.userId,
            `Your joke "${currentJoke.setup.substring(0, 20)}..." received a new rating!`,
            'rating',
            currentJoke.id
          );
        }
      } catch (error) {
        console.error('Error updating joke rating or user level:', error);
      }
    } else if (!user) {
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
  
        // Create notification for joke creator
        const jokeRef = doc(db, 'jokes', jokeId);
        const jokeDoc = await getDoc(jokeRef);
        if (jokeDoc.exists() && jokeDoc.data().userId !== user.uid) {
          await createNotification(
            jokeDoc.data().userId,
            `Your joke "${jokeDoc.data().setup.substring(0, 20)}..." was favorited!`,
            'achievement', // Changed from 'favorite' to 'achievement'
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

        // Create notification for the user
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

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ width: 60, height: 60, bgcolor: 'primary.main', mb: 1 }}
          src={user?.photoURL || undefined}
        >
          {user?.displayName?.[0] || user?.email?.[0] || 'U'}
        </Avatar>
        <Typography variant="subtitle1">{user?.displayName || 'User'}</Typography>
        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to="/" sx={{ borderRadius: '0 20px 20px 0' }}>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/profile">
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button component={Link} to="/categories">
          <ListItemText primary="Categories" />
        </ListItem>
        {user && (
          <ListItem button onClick={handleSubmitJokeClick}>
            <ListItemText primary="Submit a Joke" />
          </ListItem>
        )}
        {user && (
          <ListItem button onClick={signOut}>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img 
                  src={logo} 
                  alt="Really Funny Dad Jokes" 
                  style={{ height: '40px', marginRight: '10px' }}
                />
                <Typography variant="h6" component="div">
                  Really Funny Dad Jokes
                </Typography>
              </Link>
              <Box>
                {user && <NotificationComponent />}
                <IconButton sx={{ ml: 1 }} onClick={() => setDarkMode(!darkMode)} color="inherit">
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {drawerContent}
          </Drawer>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              style: {
                width: '250px',
                padding: '8px',
              },
            }}
          >
            <MenuItem onClick={() => { signIn(); handleClose(); }}>
              <Button fullWidth variant="outlined" startIcon={<GoogleIcon />}>
                Sign in with Google
              </Button>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem>
              <Auth onSignIn={handleEmailSignIn} onClose={handleClose} />
            </MenuItem>
          </Menu>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
              <Routes>
                <Route path="/" element={
                  <>
                    <HeroSection onGetRandomJoke={getRandomJoke} />
                    
                    {randomJoke && (
                      <Box sx={{ my: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>Random Joke</Typography>
                        <JokeDisplay 
                          joke={randomJoke}
                          onRate={rateJoke}
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
                        <Typography variant="h5" gutterBottom>
                          Joke of the Day
                        </Typography>
                        <JokeDisplay 
                          joke={jokeOfTheDay} 
                          onRate={rateJoke} 
                          onToggleFavorite={() => toggleFavorite(jokeOfTheDay.id)}
                          isFavorite={favoriteJokes.includes(jokeOfTheDay.id)}
                        />
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                      {displayedJokes.map(joke => (
                        <Box key={joke.id} sx={{ width: '100%' }}>
                          <JokeDisplay 
                            joke={joke} 
                            onRate={rateJoke} 
                            onToggleFavorite={() => toggleFavorite(joke.id)}
                            isFavorite={favoriteJokes.includes(joke.id)}
                          />
                        </Box>
                      ))}
                    </Box>

                    <Button variant="contained" onClick={getRandomJoke} sx={{ mt: 2 }}>
                      Get Another Joke
                    </Button>

                    <Leaderboard />
                    <JokeSearch />
                  </>
                } />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:categoryName" element={<CategoryJokesPage />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />
              </Routes>
            </Box>
          </Container>
          <JokeSubmissionModal
            open={showJokeSubmissionModal}
            onClose={() => setShowJokeSubmissionModal(false)}
            onSubmit={submitJoke}
          />
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;