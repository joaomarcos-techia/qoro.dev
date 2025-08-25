
'use client';

import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
  signOut as firebaseSignOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
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
        // Log out the user immediately if their email is not verified.
        await firebaseSignOut(auth); 
        throw new Error('Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada e clique no link de confirmação antes de fazer o login.');
      }
      
      return user;
    } catch (error: any) {
      console.error("Error signing in:", error);
      // Pass specific error messages through
      if (error.message.includes('e-mail ainda não foi verificado')) {
          throw error;
      }
      throw new Error('E-mail ou senha inválidos. Por favor, tente novamente.');
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

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("Nenhum usuário autenticado encontrado.");
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        // Re-authenticate the user to confirm their identity
        await reauthenticateWithCredential(user, credential);
        // If re-authentication is successful, update the password
        await updatePassword(user, newPassword);
    } catch (error) {
        console.error("Error changing password:", error);
        // Provide a more specific error for wrong password
        if (error instanceof Error && (error as any).code === 'auth/wrong-password') {
            throw new Error("A senha atual está incorreta. Tente novamente.");
        }
        throw new Error("Falha ao alterar a senha. Faça o login novamente por segurança e tente de novo.");
    }
};
