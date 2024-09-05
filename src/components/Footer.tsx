import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: 'center',
        padding: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} This website was created by Sandhu Software with lots of help from Mr. Saav and Ms. Maeva and some motivation from my brother Doyle.
      </Typography>
    </Box>
  );
};

export default Footer;