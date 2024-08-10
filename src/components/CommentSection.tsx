import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography, Snackbar, IconButton, CircularProgress } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import ReplySection from './ReplySection';

interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: Timestamp;
}

interface CommentSectionProps {
  jokeId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ jokeId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching comments for jokeId:", jokeId);
    setIsLoading(true);
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('jokeId', '==', jokeId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
      console.log("Fetched comments:", fetchedComments);
      setComments(fetchedComments);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [jokeId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newComment.trim()) return;

    console.log("Submitting comment for jokeId:", jokeId);
    try {
      await addDoc(collection(db, 'comments'), {
        text: newComment,
        jokeId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        createdAt: Timestamp.now()
      });
      setNewComment('');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        startIcon={<CommentIcon />}
        onClick={() => setShowComments(!showComments)}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </Button>

      {showComments && (
        <>
          <Typography variant="h6">Comments</Typography>
          <form onSubmit={handleSubmitComment}>
            <TextField
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Button type="submit" variant="contained" color="primary">
              Post Comment
            </Button>
          </form>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {comments.map((comment) => (
                <ListItem key={comment.id} divider>
                  <ListItemText
                    primary={comment.text}
                    secondary={`${comment.username} - ${comment.createdAt.toDate().toLocaleString()}`}
                  />
                  <Button onClick={() => setSelectedComment(selectedComment === comment.id ? null : comment.id)}>
                    {selectedComment === comment.id ? 'Hide Replies' : 'Show Replies'}
                  </Button>
                  {selectedComment === comment.id && (
                    <ReplySection commentId={comment.id} />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Your comment has been submitted"
      />
    </Box>
  );
};

export default CommentSection;