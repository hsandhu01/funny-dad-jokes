import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onGetRandomJoke: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetRandomJoke }) => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #4A90E2 0%, #81C784 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        mb: 6,
        borderRadius: '0 0 20% 20%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Unlock a world of laughter
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h5"
            paragraph
            sx={{
              textAlign: 'center',
              mb: 4,
              fontStyle: 'italic',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
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
            size="large"
            onClick={onGetRandomJoke}
            sx={{
              display: 'block',
              mx: 'auto',
              px: 4,
              py: 1.5,
              fontSize: '1.2rem',
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
      </Container>
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 200,
          height: 200,
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
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />
    </Box>
  );
};

export default HeroSection;