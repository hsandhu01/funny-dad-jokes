import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const useSocial = (userId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (auth.currentUser) {
        const followDoc = doc(db, 'follows', `${auth.currentUser.uid}_${userId}`);
        const docSnap = await getDoc(followDoc);
        setIsFollowing(docSnap.exists());
      }
    };

    const fetchFollowCounts = async () => {
      const followersQuery = query(collection(db, 'follows'), where('following', '==', userId));
      const followingQuery = query(collection(db, 'follows'), where('follower', '==', userId));
      
      const [followersSnap, followingSnap] = await Promise.all([
        getDocs(followersQuery),
        getDocs(followingQuery)
      ]);

      setFollowersCount(followersSnap.size);
      setFollowingCount(followingSnap.size);
    };

    checkFollowStatus();
    fetchFollowCounts();
  }, [userId]);

  const follow = async () => {
    if (auth.currentUser) {
      const followDoc = doc(db, 'follows', `${auth.currentUser.uid}_${userId}`);
      await setDoc(followDoc, {
        follower: auth.currentUser.uid,
        following: userId,
        timestamp: new Date()
      });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };

  const unfollow = async () => {
    if (auth.currentUser) {
      const followDoc = doc(db, 'follows', `${auth.currentUser.uid}_${userId}`);
      await deleteDoc(followDoc);
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    }
  };

  return { isFollowing, followersCount, followingCount, follow, unfollow };
};