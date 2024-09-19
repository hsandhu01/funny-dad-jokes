import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const useSocial = (userId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchSocialData = async () => {
      if (auth.currentUser) {
        // Check if current user is following the profile user
        const followDoc = doc(db, 'follows', `${auth.currentUser.uid}_${userId}`);
        const followSnapshot = await getDocs(query(collection(db, 'follows'), where('following', '==', userId)));
        const followingSnapshot = await getDocs(query(collection(db, 'follows'), where('follower', '==', userId)));
        
        setIsFollowing(followSnapshot.docs.some(doc => doc.data().follower === auth.currentUser?.uid));
        setFollowersCount(followSnapshot.size);
        setFollowingCount(followingSnapshot.size);
      }
    };

    fetchSocialData();
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