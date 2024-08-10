import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

interface Reply {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: Timestamp;
}

interface ReplySectionProps {
  commentId: string;
}

const ReplySection: React.FC<ReplySectionProps> = ({ commentId }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    const repliesRef = collection(db, 'replies');
    const q = query(repliesRef, where('commentId', '==', commentId), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReplies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reply));
      setReplies(fetchedReplies);
    });

    return () => unsubscribe();
  }, [commentId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newReply.trim()) return;

    try {
      await addDoc(collection(db, 'replies'), {
        text: newReply,
        commentId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        createdAt: Timestamp.now()
      });
      setNewReply('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <Box sx={{ ml: 4, mt: 2 }}>
      <Typography variant="subtitle1">Replies</Typography>
      <form onSubmit={handleSubmitReply}>
        <TextField
          fullWidth
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Add a reply..."
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
        <Button type="submit" variant="contained" color="primary" size="small">
          Post Reply
        </Button>
      </form>
      <List>
        {replies.map((reply) => (
          <ListItem key={reply.id} divider>
            <ListItemText
              primary={reply.text}
              secondary={`${reply.username} - ${reply.createdAt.toDate().toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ReplySection;