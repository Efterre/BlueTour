import { db } from '../../firebase'; // Import your Firebase configuration
import { doc, setDoc } from 'firebase/firestore';

export const saveUserToDatabase = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), userData);
  } catch (error) {
    console.error('Error saving user to database:', error);
  }

};

