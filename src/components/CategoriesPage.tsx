import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  CircularProgress,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';

interface Category {
  name: string;
  count: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Set loading state true when starting to fetch
      const jokesRef = collection(db, 'jokes');
      const snapshot = await getDocs(jokesRef);
      const categoryCounts: { [key: string]: number } = {};

      snapshot.forEach((doc) => {
        const category = doc.data().category as string | undefined;
        if (category) { // Check if category exists
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      const categoryList = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
      setCategories(categoryList);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Joke Categories
      </Typography>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.name}>
            <Card>
              <CardActionArea component={Link} to={`/category/${category.name}`}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {category.name}
                  </Typography>
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
