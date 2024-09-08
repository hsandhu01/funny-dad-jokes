import React from 'react';
import { Box, Typography, Button, Container, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import SwipeIcon from '@mui/icons-material/Swipe';

// Define the Joke interface
interface Joke {
  id: string;
  setup: string;
  punchline: string;
  category: string;
  rating: number;
  ratingCount: number;
}

interface HeroSectionProps {
  onGetRandomJoke: (count: number) => Joke[];
  isMobile: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetRandomJoke, isMobile }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #4A90E2 0%, #81C784 100%)',
        color: 'white',
        py: { xs: 4, sm: 6, md: 8 },
        mb: 4,
        borderRadius: '0 0 10% 10%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Unlock a world of laughter
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            variant="h6"
            paragraph
            sx={{
              textAlign: 'center',
              mb: 3,
              fontStyle: 'italic',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            }}
          >
            "Because Groans are Just Laughs in Disguise!"
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            color="secondary"
            size={isSmallScreen ? "medium" : "large"}
            onClick={() => onGetRandomJoke(1)}
            sx={{
              display: 'block',
              mx: 'auto',
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              fontWeight: 'bold',
              borderRadius: '50px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
              },
            }}
          >
            Get a Random Joke
          </Button>
        </motion.div>
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <SwipeIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Swipe for more jokes</Typography>
            </Box>
          </motion.div>
        )}
      </Container>
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        sx={{
          position: 'absolute',
          top: -25,
          right: -25,
          width: 75,
          height: 75,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />
    </Box>
  );
};

export default HeroSection;