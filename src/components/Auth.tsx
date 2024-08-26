import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { initializeUserData } from '../utils/userUtils';
import { Box, TextField, Button, Typography, Tabs, Tab } from '@mui/material';

interface AuthProps {
  onSignIn: () => void;
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSignIn, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (tabValue === 1) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await initializeUserData(userCredential.user.uid, userCredential.user.email || '');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSignIn();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="fullWidth" sx={{ mb: 1 }}>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <TextField
          size="small"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button fullWidth type="submit" variant="contained" color="primary" size="small">
          {tabValue === 0 ? 'Log In' : 'Sign Up'}
        </Button>
        {error && <Typography color="error" variant="caption" sx={{ mt: 1, textAlign: 'center' }}>{error}</Typography>}
      </Box>
    </Box>
  );
};

export default Auth;