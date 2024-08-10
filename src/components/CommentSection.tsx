import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Box, TextField, Button, List, ListItem, ListItemText, Typography, Snackbar, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: Date;
}

interface CommentSectionProps {
  jokeId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ jokeId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('jokeId', '==', jokeId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Comment));
      setComments(fetchedComments);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching comments:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [jokeId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        text: newComment,
        jokeId,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      });
      setNewComment('');
      setSnackbarMessage('Your comment has been submitted');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!auth.currentUser) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setSnackbarMessage('Comment deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.text);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'comments', editingComment.id), {
        text: editCommentText
      });
      setEditingComment(null);
      setSnackbarMessage('Comment updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating comment:', error);
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
          ) : comments.length > 0 ? (
            <List>
              {comments.map((comment) => (
                <ListItem key={comment.id} divider>
                  <ListItemText
                    primary={comment.text}
                    secondary={`${comment.username} - ${comment.createdAt.toLocaleString()}`}
                  />
                  {auth.currentUser && auth.currentUser.uid === comment.userId && (
                    <>
                      <IconButton onClick={() => handleEditComment(comment)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteComment(comment.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No comments yet. Be the first to comment!</Typography>
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
        message={snackbarMessage}
      />
      <Dialog open={editingComment !== null} onClose={() => setEditingComment(null)}>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={editCommentText}
            onChange={(e) => setEditCommentText(e.target.value)}
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingComment(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentSection;