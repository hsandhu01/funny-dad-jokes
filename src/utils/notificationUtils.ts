import { db, auth } from '../firebase';
import { collection, addDoc, Timestamp, query, where, orderBy, limit, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';

export interface Notification {
    id?: string;
    userId: string;
    message: string;
    type: 'comment' | 'rating' | 'achievement' | 'favorite';
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

export const getAllNotifications = async (userId: string, limitNumber: number = 50) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitNumber)
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  } catch (error) {
    console.error("Error fetching all notifications:", error);
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

export const markAllNotificationsAsRead = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('isRead', '==', false)
  );

  try {
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

export const deleteOldNotifications = async (userId: string, daysOld: number = 30) => {
  const notificationsRef = collection(db, 'notifications');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('createdAt', '<', Timestamp.fromDate(cutoffDate))
  );

  try {
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error deleting old notifications:", error);
  }
};