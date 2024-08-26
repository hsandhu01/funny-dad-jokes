import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  favoriteCategory: string;
  profilePictureURL: string;
  level: number;
  experience: number;
  totalJokesSubmitted: number;
  totalRatingsReceived: number;
  totalRatingsGiven: number;
  totalFavoritesReceived: number;
  averageRating: number;
  totalAchievements: number;
}

export const initializeUserData = async (userId: string, email: string) => {
  const userRef = doc(db, 'users', userId);
  const userData: UserData = {
    uid: userId,
    email: email,
    username: `User${userId.substr(0, 5)}`,
    bio: '',
    location: '',
    favoriteCategory: '',
    profilePictureURL: '',
    level: 1,
    experience: 0,
    totalJokesSubmitted: 0,
    totalRatingsReceived: 0,
    totalRatingsGiven: 0,
    totalFavoritesReceived: 0,
    averageRating: 0,
    totalAchievements: 0
  };
  await setDoc(userRef, userData, { merge: true });
};