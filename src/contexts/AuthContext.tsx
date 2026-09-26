import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  loginWithEmailOrMobile: (emailOrMobile: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadOrCreateProfile(firebaseUser: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    return existing.data() as UserProfile;
  }

  const profile: UserProfile = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Customer' : 'Customer'),
    email: firebaseUser.email || '',
    role: 'client',
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, profile);
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const nextProfile = await loadOrCreateProfile(firebaseUser);
        setProfile(nextProfile);
      } catch (err) {
        console.error('Failed to load authenticated user profile:', err);
        setError('We could not load your secure account profile. Please try again.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google Auth Error:', err);
      setError(err?.message || 'An unexpected error occurred during Google sign in.');
      throw err;
    }
  };

  const continueAsGuest = async () => {
    setError(null);
    try {
      if (auth.currentUser) return;
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Guest session error:', err);
      setError(err?.message || 'Unable to create a secure guest session.');
      throw err;
    }
  };

  const loginWithEmailOrMobile = async (_emailOrMobile: string) => {
    setError('Email/mobile sign-in requires a verified OTP provider. Use Google Sign-In or Continue as Guest.');
    throw new Error('Email/mobile sign-in requires a verified OTP provider. Use Google Sign-In or Continue as Guest.');
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setError(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError('Failed to sign out.');
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const safeData: Partial<UserProfile> = { ...data };
    delete safeData.id;
    delete safeData.email;
    delete safeData.role;
    delete safeData.createdAt;

    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, safeData, { merge: true });
      setProfile(prev => prev ? { ...prev, ...safeData } : null);
    } catch (err) {
      setError('Failed to update profile.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      error,
      loginWithGoogle,
      continueAsGuest,
      loginWithEmailOrMobile,
      logout,
      updateProfile,
      clearError: () => setError(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
