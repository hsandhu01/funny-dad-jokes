import { db, auth } from '../firebase';
import { collection, addDoc, Timestamp, query, where, orderBy, limit, getDocs, updateDoc, doc } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  message: string;
  type: 'comment' | 'rating' | 'achievement';
  relatedItemId?: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export const createNotification = async (
  userId: string,
  message: string,
  type: Notification['type'],
  relatedItemId?: string
) => {
  const notificationsRef = collection(db, 'notifications');
  const newNotification: Omit<Notification, 'id'> = {
    userId,
    message,
    type,
    relatedItemId,
    isRead: false,
    createdAt: Timestamp.now()
  };

  try {
    await addDoc(notificationsRef, newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export const getUnreadNotifications = async (userId: string, limitNumber: number = 10) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('isRead', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitNumber)
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  try {
    await updateDoc(notificationRef, { isRead: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};
