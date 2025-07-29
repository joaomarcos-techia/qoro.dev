'use client';

import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
  signOut as firebaseSignOut,
  updatePassword,
} from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

// The signUp logic is now handled by a Genkit flow for security reasons.
// The client-side signUp function has been removed.

export const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (!user.emailVerified) {
        // Optionally re-send verification email
        await sendEmailVerification(user);
        throw new Error('Por favor, verifique seu e-mail antes de fazer login. Um novo e-mail de verificação foi enviado.');
      }
  
      return user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
};

export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const changePassword = async (newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Nenhum usuário autenticado encontrado.");
    }
    try {
        await updatePassword(user, newPassword);
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};
