import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { collection, getDocs, query, where, CollectionReference, Query, DocumentData, addDoc, updateDoc, doc, deleteDoc, limit } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { db, auth } from './firebase';
import JokeDisplay from './components/JokeDisplay';
import JokeSubmissionForm from './components/JokeSubmissionForm';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import JokeSearch from './components/JokeSearch';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

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

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

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
      } catch (error) {
        console.error('Error updating joke rating', error);
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
        // Add to favorites
        await addDoc(favoritesRef, { userId: user.uid, jokeId });
        setFavoriteJokes([...favoriteJokes, jokeId]);
      } else {
        // Remove from favorites
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

  const submitJoke = async (joke: Omit<Joke, 'id' | 'rating' | 'ratingCount'>) => {
    if (user) {
      try {
        await addDoc(collection(db, 'jokes'), {
          ...joke,
          rating: 0,
          ratingCount: 0,
        });
        setShowSubmissionForm(false);
        fetchJokes();
      } catch (error) {
        console.error('Error submitting joke', error);
      }
    }
  };

  const handleEmailSignIn = () => {
    fetchJokes();
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value as string);
  };

  if (loading) return <div>Loading jokes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Dad Jokes Extravaganza
                </Link>
              </Typography>
              {user ? (
                <>
                  <Button color="inherit" component={Link} to="/profile">Profile</Button>
                  <Button color="inherit" onClick={signOut}>Sign Out</Button>
                  <Button color="inherit" onClick={() => setShowSubmissionForm(!showSubmissionForm)}>
                    {showSubmissionForm ? 'Cancel' : 'Submit a Joke'}
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={signIn}>Sign In with Google</Button>
                  <Auth onSignIn={handleEmailSignIn} />
                </>
              )}
              <IconButton sx={{ ml: 1 }} onClick={() => setDarkMode(!darkMode)} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>

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
            </Routes>
          </Container>
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;