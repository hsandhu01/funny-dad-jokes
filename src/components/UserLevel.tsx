import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface UserLevelProps {
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

const UserLevel: React.FC<UserLevelProps> = ({ level, experience, experienceToNextLevel }) => {
  const progress = (experience / experienceToNextLevel) * 100;

  return (
    <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', textAlign: 'center', mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Level {level}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {experience} / {experienceToNextLevel} XP
      </Typography>
    </Box>
  );
};

export default UserLevel;