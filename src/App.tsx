import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { collection, getDocs, query, where, CollectionReference, Query, addDoc, updateDoc, doc, deleteDoc, limit } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { db, auth } from './firebase';
import JokeDisplay from './components/JokeDisplay';
import JokeSubmissionForm from './components/JokeSubmissionForm';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import JokeSearch from './components/JokeSearch';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box, FormControl, InputLabel, Select, MenuItem, IconButton, Menu, Divider, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
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
import logo from '../src/assets/dad-jokes-logo.png';
import { SelectChangeEvent } from '@mui/material/Select';

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
      main: '#F5A623',
    },
    background: {
      default: mode === 'light' ? '#F5F5F5' : '#121212',
      paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#FFFFFF',
      secondary: mode === 'light' ? '#666666' : '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
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
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null);
  const [jokeOfTheDay, setJokeOfTheDay] = useState<Joke | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [favoriteJokes, setFavoriteJokes] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      setCurrentJoke(jokesList[Math.floor(Math.random() * jokesList.length)]);
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

  const getRandomJoke = () => {
    const newJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setCurrentJoke(null);
    setTimeout(() => setCurrentJoke(newJoke), 500);
  };

  const rateJoke = async (rating: number) => {
    if (currentJoke && user) {
      const jokeRef = doc(db, 'jokes', currentJoke.id);
      const newRating = (currentJoke.rating * currentJoke.ratingCount + rating) / (currentJoke.ratingCount + 1);
      const newRatingCount = currentJoke.ratingCount + 1;
      
      try {
        await updateDoc(jokeRef, { rating: newRating, ratingCount: newRatingCount });
        setCurrentJoke({ ...currentJoke, rating: newRating, ratingCount: newRatingCount });
        const result = await updateUserLevel(currentJoke.userId, 'receiveRating');
        console.log('User level updated after receiving rating:', result);
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

  const submitJoke = async (joke: Omit<Joke, 'id' | 'rating' | 'ratingCount' | 'userId'>) => {
    if (user) {
      try {
        await addDoc(collection(db, 'jokes'), {
          ...joke,
          userId: user.uid,
          rating: 0,
          ratingCount: 0,
        });
        setShowSubmissionForm(false);
        fetchJokes();
        await checkAchievements(user.uid);
        const result = await updateUserLevel(user.uid, 'submitJoke');
        console.log('User level updated after submitting joke:', result);
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
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/categories">
          <ListItemIcon><CategoryIcon /></ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
        {user && (
          <ListItem button onClick={() => setShowSubmissionForm(!showSubmissionForm)}>
            <ListItemIcon><AddIcon /></ListItemIcon>
            <ListItemText primary="Submit a Joke" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  if (loading) return <div>Loading jokes...</div>;
  if (error) return <div>{error}</div>;

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
                {user ? (
                  <>
                    <Button color="inherit" component={Link} to="/profile">Profile</Button>
                    <Button color="inherit" onClick={signOut}>Sign Out</Button>
                  </>
                ) : (
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                )}
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

          <Container maxWidth="md">
            <Routes>
              <Route path="/" element={
                <Box sx={{ my: 4 }}>
                  <FormControl fullWidth>
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

                  {jokeOfTheDay && (
                    <Box sx={{ my: 4 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
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

                  {showSubmissionForm && user ? (
                    <JokeSubmissionForm onSubmit={submitJoke} />
                  ) : (
                    <AnimatePresence mode="wait">
                      {currentJoke && (
                        <JokeDisplay 
                          key={currentJoke.id} 
                          joke={currentJoke} 
                          onRate={rateJoke} 
                          onToggleFavorite={() => toggleFavorite(currentJoke.id)}
                          isFavorite={favoriteJokes.includes(currentJoke.id)}
                        />
                      )}
                    </AnimatePresence>
                  )}
                  
                  <Button variant="contained" onClick={getRandomJoke} sx={{ mt: 2 }}>
                    Get Another Joke
                  </Button>

                  <Leaderboard />
                  <JokeSearch />
                </Box>
              } />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/categories" element={<Typography>Categories Page (To be implemented)</Typography>} />
            </Routes>
          </Container>
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;
