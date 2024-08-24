import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export interface UserData {
  uid: string;
  level: number;
  experience: number;
  totalJokesSubmitted: number;
  totalRatingsReceived: number;
}

const EXPERIENCE_PER_LEVEL = 100;
const EXPERIENCE_PER_JOKE = 10;
const EXPERIENCE_PER_RATING = 1;

export const calculateLevel = (experience: number): number => {
  return Math.floor(experience / EXPERIENCE_PER_LEVEL) + 1;
};

export const calculateExperienceToNextLevel = (level: number): number => {
  return level * EXPERIENCE_PER_LEVEL;
};

export const updateUserLevel = async (userId: string, action: 'submitJoke' | 'receiveRating') => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as UserData;
    let experienceGain = action === 'submitJoke' ? EXPERIENCE_PER_JOKE : EXPERIENCE_PER_RATING;
    
    const newExperience = userData.experience + experienceGain;
    const newLevel = calculateLevel(newExperience);
    
    await updateDoc(userRef, {
      experience: increment(experienceGain),
      level: newLevel,
      [action === 'submitJoke' ? 'totalJokesSubmitted' : 'totalRatingsReceived']: increment(1)
    });

    return {
      level: newLevel,
      experience: newExperience,
      experienceToNextLevel: calculateExperienceToNextLevel(newLevel)
    };
  } else {
    console.error('User document does not exist');
    return null;
  }
};

export const initializeUserData = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    uid: userId,
    level: 1,
    experience: 0,
    totalJokesSubmitted: 0,
    totalRatingsReceived: 0,
  });
};