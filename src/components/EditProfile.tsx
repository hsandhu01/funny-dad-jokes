import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserData } from '../utils/userUtils';

interface EditProfileProps {
  userData: UserData;
  onUpdate: (updatedData: Partial<UserData>) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userData, onUpdate }) => {
  const [username, setUsername] = useState(userData.username);
  const [bio, setBio] = useState(userData.bio);
  const [location, setLocation] = useState(userData.location);
  const [favoriteCategory, setFavoriteCategory] = useState(userData.favoriteCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        username,
        bio,
        location,
        favoriteCategory
      };
      
      try {
        await updateDoc(userRef, updatedData);
        onUpdate(updatedData);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>Edit Profile</Typography>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
      />
      <TextField
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        fullWidth
        multiline
        rows={3}
      />
      <TextField
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        fullWidth
      />
      <TextField
        label="Favorite Category"
        value={favoriteCategory}
        onChange={(e) => setFavoriteCategory(e.target.value)}
        fullWidth
      />
      <Button type="submit" variant="contained" color="primary">
        Save Changes
      </Button>
    </Box>
  );
};

export default EditProfile;