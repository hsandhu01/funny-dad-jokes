import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  level: number;
  experience: number;
  totalJokesSubmitted: number;
  totalRatingsReceived: number;
  averageRating: number;
}

export const initializeUserData = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    uid: userId,
    level: 1,
    experience: 0,
    totalJokesSubmitted: 0,
    totalRatingsReceived: 0,
    averageRating: 0
  }, { merge: true });
};