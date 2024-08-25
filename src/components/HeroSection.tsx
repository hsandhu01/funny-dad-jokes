import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface HeroSectionProps {
  onGetRandomJoke: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetRandomJoke }) => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: 8, 
      background: 'linear-gradient(45deg, #4A90E2 30%, #81C784 90%)',
      color: 'white',
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      mb: 4
    }}>
      <Typography variant="h1" gutterBottom>
        Unlock a world of laughter
      </Typography>
      <Typography variant="h5" paragraph>
      "Because Groans are Just Laughs in Disguise!"
      </Typography>
      <Button 
        variant="contained" 
        color="secondary" 
        size="large" 
        onClick={onGetRandomJoke}
      >
        Get a Random Joke
      </Button>
    </Box>
  );
};

export default HeroSection;