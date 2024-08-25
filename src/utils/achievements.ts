import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection } from 'firebase/firestore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  type: 'jokes' | 'ratings' | 'comments' | 'favorites';
}

const achievements: Achievement[] = [
  { id: 'first_joke', name: 'Joke Novice', description: 'Submit your first joke', icon: '😊', threshold: 1, type: 'jokes' },
  { id: 'ten_jokes', name: 'Joke Enthusiast', description: 'Submit 10 jokes', icon: '😄', threshold: 10, type: 'jokes' },
  { id: 'fifty_jokes', name: 'Joke Master', description: 'Submit 50 jokes', icon: '🤣', threshold: 50, type: 'jokes' },
  { id: 'first_rating', name: 'Critic in Training', description: 'Rate your first joke', icon: '👍', threshold: 1, type: 'ratings' },
  { id: 'fifty_ratings', name: 'Seasoned Critic', description: 'Rate 50 jokes', icon: '⭐', threshold: 50, type: 'ratings' },
  { id: 'first_comment', name: 'Conversation Starter', description: 'Leave your first comment', icon: '💬', threshold: 1, type: 'comments' },
  { id: 'twenty_comments', name: 'Chatterbox', description: 'Leave 20 comments', icon: '🗨️', threshold: 20, type: 'comments' },
  { id: 'first_favorite', name: 'Joke Collector', description: 'Add your first joke to favorites', icon: '❤️', threshold: 1, type: 'favorites' },
  { id: 'ten_favorites', name: 'Joke Connoisseur', description: 'Add 10 jokes to favorites', icon: '💖', threshold: 10, type: 'favorites' },
];

export const checkAndUpdateAchievements = async (userId: string, type: 'jokes' | 'ratings' | 'comments' | 'favorites') => {
  console.log(`Checking achievements for user ${userId}, type: ${type}`);
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    console.error('User document does not exist');
    return;
  }

  const userData = userDoc.data();
  const relevantCount = userData[`total${type.charAt(0).toUpperCase() + type.slice(1)}`] || 0;
  console.log(`Relevant count for ${type}: ${relevantCount}`);

  const relevantAchievements = achievements.filter(a => a.type === type);
  console.log(`Checking ${relevantAchievements.length} achievements for ${type}`);

  for (const achievement of relevantAchievements) {
    if (relevantCount >= achievement.threshold) {
      console.log(`User meets criteria for achievement: ${achievement.name}`);
      const userAchievementRef = doc(collection(userRef, 'achievements'), achievement.id);
      const userAchievementDoc = await getDoc(userAchievementRef);

      if (!userAchievementDoc.exists()) {
        console.log(`Unlocking new achievement: ${achievement.name}`);
        await setDoc(userAchievementRef, {
          ...achievement,
          unlockedAt: new Date()
        });

        await updateDoc(userRef, {
          totalAchievements: increment(1)
        });

        console.log(`Achievement ${achievement.name} unlocked for user ${userId}`);
      } else {
        console.log(`Achievement ${achievement.name} already unlocked`);
      }
    }
  }
};