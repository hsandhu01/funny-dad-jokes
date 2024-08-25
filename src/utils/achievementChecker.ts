import { collection, query, where, getDocs, addDoc, updateDoc, increment, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Achievement {
  id: string;
  name: string;
  description: string;
  threshold: number;
  icon: string;
}

const achievements: Achievement[] = [
  { id: 'JOKE_NOVICE', name: 'Joke Novice', description: 'Submit your first joke', threshold: 1, icon: '😊' },
  { id: 'JOKE_ENTHUSIAST', name: 'Joke Enthusiast', description: 'Submit 10 jokes', threshold: 10, icon: '😄' },
  { id: 'JOKE_MASTER', name: 'Joke Master', description: 'Submit 50 jokes', threshold: 50, icon: '🤣' },
  { id: 'RATING_ROOKIE', name: 'Rating Rookie', description: 'Rate your first joke', threshold: 1, icon: '👍' },
  { id: 'RATING_PRO', name: 'Rating Pro', description: 'Rate 50 jokes', threshold: 50, icon: '🌟' },
  { id: 'COMMENT_STARTER', name: 'Comment Starter', description: 'Leave your first comment', threshold: 1, icon: '💬' },
  { id: 'COMMENT_ENTHUSIAST', name: 'Comment Enthusiast', description: 'Leave 20 comments', threshold: 20, icon: '📢' },
];

export const checkAchievements = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  if (!userData) return;

  const { totalJokesSubmitted, totalRatingsGiven, totalCommentsLeft } = userData;

  const achievementsRef = collection(db, 'achievements');
  const userAchievementsQuery = query(achievementsRef, where('userId', '==', userId));
  const userAchievementsSnapshot = await getDocs(userAchievementsQuery);
  const unlockedAchievements = new Set(userAchievementsSnapshot.docs.map(doc => doc.data().id));

  for (const achievement of achievements) {
    if (!unlockedAchievements.has(achievement.id)) {
      let thresholdMet = false;

      switch (achievement.id) {
        case 'JOKE_NOVICE':
        case 'JOKE_ENTHUSIAST':
        case 'JOKE_MASTER':
          thresholdMet = totalJokesSubmitted >= achievement.threshold;
          break;
        case 'RATING_ROOKIE':
        case 'RATING_PRO':
          thresholdMet = totalRatingsGiven >= achievement.threshold;
          break;
        case 'COMMENT_STARTER':
        case 'COMMENT_ENTHUSIAST':
          thresholdMet = totalCommentsLeft >= achievement.threshold;
          break;
      }

      if (thresholdMet) {
        await addDoc(achievementsRef, {
          ...achievement,
          userId,
          isUnlocked: true,
          unlockedAt: new Date()
        });

        // Update user's achievement count
        await updateDoc(userRef, {
          totalAchievements: increment(1)
        });

        // I'll add notifications here
      }
    }
  }
};