import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormGroup, FormControlLabel, Button } from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface NotificationPreferences {
  ratings: boolean;
  favorites: boolean;
  comments: boolean;
  achievements: boolean;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    ratings: true,
    favorites: true,
    comments: true,
    achievements: true,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().notificationPreferences) {
          setPreferences(userDoc.data().notificationPreferences);
        }
      }
    };

    fetchPreferences();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({ ...preferences, [event.target.name]: event.target.checked });
  };

  const handleSave = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { notificationPreferences: preferences }, { merge: true });
      alert('Notification preferences saved!');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Notification Settings</Typography>
      <FormGroup>
        <FormControlLabel 
          control={<Switch checked={preferences.ratings} onChange={handleChange} name="ratings" />}
          label="Ratings"
        />
        <FormControlLabel 
          control={<Switch checked={preferences.favorites} onChange={handleChange} name="favorites" />}
          label="Favorites"
        />
        <FormControlLabel 
          control={<Switch checked={preferences.comments} onChange={handleChange} name="comments" />}
          label="Comments"
        />
        <FormControlLabel 
          control={<Switch checked={preferences.achievements} onChange={handleChange} name="achievements" />}
          label="Achievements"
        />
      </FormGroup>
      <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
        Save Preferences
      </Button>
    </Box>
  );
};

export default NotificationSettings;