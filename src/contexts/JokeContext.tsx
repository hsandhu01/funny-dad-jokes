import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { collection, getDocs, query, where, orderBy, limit, DocumentData, QueryDocumentSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
  userId: string;
  createdAt: Date;
}

interface JokeContextType {
  jokes: Joke[];
  loading: boolean;
  error: string | null;
  fetchJokes: (category?: string) => Promise<void>;
  getRandomJoke: () => Joke | null;
  getJokeById: (id: string) => Joke | null;
  addJoke: (joke: Omit<Joke, 'id' | 'rating' | 'ratingCount' | 'createdAt'>) => Promise<void>;
  updateJoke: (id: string, updates: Partial<Joke>) => Promise<void>;
  deleteJoke: (id: string) => Promise<void>;
}

const JokeContext = createContext<JokeContextType | undefined>(undefined);

export const JokeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJokes = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const jokesRef = collection(db, 'jokes');
      let jokesQuery = query(jokesRef, orderBy('createdAt', 'desc'), limit(100));
      
      if (category) {
        jokesQuery = query(jokesQuery, where('category', '==', category));
      }

      console.log('Fetching jokes...'); // Debug log
      const querySnapshot = await getDocs(jokesQuery);
      console.log('Jokes fetched:', querySnapshot.size); // Debug log

      const fetchedJokes: Joke[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data() as Omit<Joke, 'id' | 'createdAt'>,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setJokes(fetchedJokes);
    } catch (err) {
      console.error('Error fetching jokes:', err);
      setError('Failed to fetch jokes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJokes();
  }, [fetchJokes]);

  const getRandomJoke = useCallback(() => {
    if (jokes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * jokes.length);
    return jokes[randomIndex];
  }, [jokes]);

  const getJokeById = useCallback((id: string) => {
    return jokes.find(joke => joke.id === id) || null;
  }, [jokes]);

  const addJoke = useCallback(async (joke: Omit<Joke, 'id' | 'rating' | 'ratingCount' | 'createdAt'>) => {
    try {
      const jokesRef = collection(db, 'jokes');
      const newJokeRef = await addDoc(jokesRef, {
        ...joke,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date()
      });
      console.log('New joke added with ID:', newJokeRef.id);
      await fetchJokes(); // Refresh jokes after adding
    } catch (err) {
      console.error('Error adding new joke:', err);
      throw err;
    }
  }, [fetchJokes]);

  const updateJoke = useCallback(async (id: string, updates: Partial<Joke>) => {
    try {
      const jokeRef = doc(db, 'jokes', id);
      await updateDoc(jokeRef, updates);
      console.log('Joke updated:', id);
      await fetchJokes(); // Refresh jokes after updating
    } catch (err) {
      console.error('Error updating joke:', err);
      throw err;
    }
  }, [fetchJokes]);

  const deleteJoke = useCallback(async (id: string) => {
    try {
      const jokeRef = doc(db, 'jokes', id);
      await deleteDoc(jokeRef);
      console.log('Joke deleted:', id);
      await fetchJokes(); // Refresh jokes after deleting
    } catch (err) {
      console.error('Error deleting joke:', err);
      throw err;
    }
  }, [fetchJokes]);

  const value = {
    jokes,
    loading,
    error,
    fetchJokes,
    getRandomJoke,
    getJokeById,
    addJoke,
    updateJoke,
    deleteJoke
  };

  return <JokeContext.Provider value={value}>{children}</JokeContext.Provider>;
};

export const useJokes = () => {
  const context = useContext(JokeContext);
  if (context === undefined) {
    throw new Error('useJokes must be used within a JokeProvider');
  }
  return context;
};