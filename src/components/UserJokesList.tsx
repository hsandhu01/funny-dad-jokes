import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface UserJokesListProps {
  userId: string;
}

const UserJokesList: React.FC<UserJokesListProps> = ({ userId }) => {
  const [jokes, setJokes] = useState<any[]>([]);

  useEffect(() => {
    const fetchJokes = async () => {
      const jokesRef = collection(db, 'jokes');
      const q = query(jokesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const jokesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJokes(jokesData);
    };

    fetchJokes();
  }, [userId]);

  return (
    <List>
      {jokes.map((joke) => (
        <ListItem key={joke.id}>
          <ListItemText
            primary={joke.setup}
            secondary={
              <>
                <Typography component="span" variant="body2" color="textPrimary">
                  {joke.punchline}
                </Typography>
                {` — ${joke.category}`}
              </>
            }
          />
        </ListItem>
      ))}
      {jokes.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          No jokes found.
        </Typography>
      )}
    </List>
  );
};

export default UserJokesList;