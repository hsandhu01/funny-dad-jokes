import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';


import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ScienceIcon from '@mui/icons-material/Science';
import PetsIcon from '@mui/icons-material/Pets';


interface Category {
  name: string;
  count: number;
  icon?: React.ReactNode;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  'pun': <EmojiEmotionsIcon />,
  'science': <ScienceIcon />,
  'animals': <PetsIcon />,
// I'll add more categories here
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const jokesRef = collection(db, 'jokes');
        const snapshot = await getDocs(jokesRef);
        const categoryCounts: { [key: string]: number } = {};

        snapshot.forEach((doc) => {
          const category = doc.data().category as string | undefined;
          if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          }
        });

        const categoryList = Object.entries(categoryCounts).map(([name, count]) => ({ 
          name, 
          count,
          icon: categoryIcons[name.toLowerCase()]
        }));
        setCategories(categoryList);
      } catch (err) {
        setError('Failed to fetch categories. Please try again later.');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const sortedCategories = useMemo(() => 
    [...categories].sort((a, b) => b.count - a.count),
    [categories]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Joke Categories
      </Typography>
      <Grid container spacing={3}>
        {sortedCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.name}>
            <Card>
              <CardActionArea component={Link} to={`/category/${category.name}`}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {category.icon}
                    <Typography variant="h5" component="div" ml={1}>
                      {category.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} jokes
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoriesPage;