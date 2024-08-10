import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const checkAchievements = async (userId: string) => {
  // Fetch user's jokes
  const jokesRef = collection(db, 'jokes');
  const q = query(jokesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const jokeCount = snapshot.docs.length;

  // Define achievements
  const achievements = [
    { id: 'JOKE_NOVICE', name: 'Joke Novice', description: 'Submit your first joke', threshold: 1 },
    { id: 'JOKE_ENTHUSIAST', name: 'Joke Enthusiast', description: 'Submit 10 jokes', threshold: 10 },
    { id: 'JOKE_MASTER', name: 'Joke Master', description: 'Submit 50 jokes', threshold: 50 },
  ];

  // Check and update achievements
  const achievementsRef = collection(db, 'achievements');
  for (const achievement of achievements) {
    if (jokeCount >= achievement.threshold) {
      const achievementQuery = query(achievementsRef, 
        where('userId', '==', userId), 
        where('id', '==', achievement.id)
      );
      const achievementSnapshot = await getDocs(achievementQuery);
      
      if (achievementSnapshot.empty) {
        await addDoc(achievementsRef, {
          ...achievement,
          userId,
          isUnlocked: true,
          unlockedAt: new Date()
        });
      }
    }
  }
};