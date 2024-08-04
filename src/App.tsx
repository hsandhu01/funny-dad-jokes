import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, CollectionReference, Query, DocumentData, addDoc, updateDoc, doc, limit } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { db, auth } from './firebase';
import JokeDisplay from './components/JokeDisplay';
import JokeSubmissionForm from './components/JokeSubmissionForm';
import './App.css';

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    fetchJokes();
    return unsubscribe;
  }, [fetchJokes]);

  useEffect(() => {
    const fetchJokeOfTheDay = async () => {
      const jokeSnapshot = await getDocs(query(collection(db, 'jokes'), limit(1)));
      if (!jokeSnapshot.empty) {
        const jokeData = jokeSnapshot.docs[0].data() as Joke;
        const { id, ...restOfJokeData } = jokeData;  // Extract id and keep the rest of the data
        setJokeOfTheDay({ id: jokeSnapshot.docs[0].id, ...restOfJokeData });
      }
    };
    fetchJokeOfTheDay();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const getRandomJoke = () => {
    setCurrentJoke(jokes[Math.floor(Math.random() * jokes.length)]);
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

  if (loading) return <div>Loading jokes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dad Jokes Extravaganza</h1>
        <nav>
          {user ? (
            <>
              <button onClick={signOut}>Sign Out</button>
              <button onClick={() => setShowSubmissionForm(!showSubmissionForm)}>
                {showSubmissionForm ? 'Cancel' : 'Submit a Joke'}
              </button>
            </>
          ) : (
            <button onClick={signIn}>Sign In with Google</button>
          )}
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>
      </header>

      <main className="App-main">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="pun">Pun</option>
          <option value="wordplay">Wordplay</option>
          <option value="science">Science</option>
          <option value="animals">Animals</option>
        </select>

        {jokeOfTheDay && (
          <div className="joke-of-the-day">
            <h2>Joke of the Day</h2>
            <JokeDisplay joke={jokeOfTheDay} onRate={rateJoke} />
          </div>
        )}

        {showSubmissionForm && user ? (
          <JokeSubmissionForm onSubmit={submitJoke} />
        ) : (
          <>
            {currentJoke && <JokeDisplay joke={currentJoke} onRate={rateJoke} />}
            <button onClick={getRandomJoke}>Get Another Joke</button>
          </>
        )}
      </main>
    </div>
  );
};

export default App;

