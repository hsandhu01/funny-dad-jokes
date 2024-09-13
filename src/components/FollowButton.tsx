import React, { useState, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface FollowButtonProps {
  userId: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (auth.currentUser) {
        const followDoc = doc(db, 'follows', `${auth.currentUser.uid}_${userId}`);
        try {
          const docSnap = await getDoc(followDoc);
          setIsFollowing(docSnap.exists());
        } catch (error) {
          console.error("Error checking follow status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const handleFollow = async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    const followDoc = doc(db, 'follows', `${auth.currentUser.uid}_${userId}`);

    try {
      if (isFollowing) {
        await deleteDoc(followDoc);
      } else {
        await setDoc(followDoc, {
          follower: auth.currentUser.uid,
          following: userId,
          timestamp: new Date()
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Button
      variant={isFollowing ? "outlined" : "contained"}
      color="primary"
      onClick={handleFollow}
      disabled={!auth.currentUser}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;