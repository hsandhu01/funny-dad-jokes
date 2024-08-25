import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Achievements</Typography>
      <Grid container spacing={2}>
        {achievements.map((achievement) => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                opacity: achievement.isUnlocked ? 1 : 0.5,
                filter: achievement.isUnlocked ? 'none' : 'grayscale(100%)'
              }}
            >
              <Typography variant="h6">{achievement.name}</Typography>
              <Typography variant="body2">{achievement.description}</Typography>
              <Box component="span" sx={{ fontSize: 48, mt: 1 }}>{achievement.icon}</Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Achievements;