import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../firebase';
import { UserData } from '../utils/userUtils';

interface EditProfileProps {
  userData: UserData;
  onUpdate: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userData, onUpdate }) => {
  const [username, setUsername] = useState(userData.username);
  const [bio, setBio] = useState(userData.bio);
  const [location, setLocation] = useState(userData.location);
  const [favoriteCategory, setFavoriteCategory] = useState(userData.favoriteCategory);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const updates: Partial<UserData> = {
      username,
      bio,
      location,
      favoriteCategory,
    };

    if (profilePicture) {
      const storage = getStorage();
      const profilePictureRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      await uploadBytes(profilePictureRef, profilePicture);
      const downloadURL = await getDownloadURL(profilePictureRef);
      updates.profilePictureURL = downloadURL;
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, updates);
    onUpdate();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Edit Profile</Typography>
      <TextField
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        margin="normal"
        multiline
        rows={3}
      />
      <TextField
        fullWidth
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Favorite Category</InputLabel>
        <Select
          value={favoriteCategory}
          onChange={(e) => setFavoriteCategory(e.target.value)}
        >
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
      <input
        accept="image/*"
        type="file"
        onChange={(e) => setProfilePicture(e.target.files ? e.target.files[0] : null)}
        style={{ display: 'none' }}
        id="profile-picture-upload"
      />
      <label htmlFor="profile-picture-upload">
        <Button variant="contained" component="span" sx={{ mt: 2 }}>
          Upload Profile Picture
        </Button>
      </label>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, ml: 2 }}>
        Save Changes
      </Button>
    </Box>
  );
};

export default EditProfile;