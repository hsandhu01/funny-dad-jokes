import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, CircularProgress, Box } from '@mui/material';

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
}

interface User {
  id: string;
  username: string;
  profilePictureURL: string;
}

const FollowersList: React.FC<FollowersListProps> = ({ userId, type }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const followsRef = collection(db, 'follows');
      const q = type === 'followers'
        ? query(followsRef, where('following', '==', userId))
        : query(followsRef, where('follower', '==', userId));

      try {
        const querySnapshot = await getDocs(q);
        const userIds = querySnapshot.docs.map(doc => 
          type === 'followers' ? doc.data().follower : doc.data().following
        );

        const usersData = await Promise.all(userIds.map(async (id) => {
          const userDoc = await getDoc(doc(db, 'users', id));
          return { id, ...userDoc.data() } as User;
        }));

        setUsers(usersData);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List>
      {users.length > 0 ? (
        users.map((user) => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Avatar src={user.profilePictureURL} alt={user.username} />
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
            />
          </ListItem>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary" align="center">
          No {type} found.
        </Typography>
      )}
    </List>
  );
};

export default FollowersList;