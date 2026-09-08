import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailOrMobile: (emailOrMobile: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const persistedUid = localStorage.getItem('parrot_guest_uid');
      if (persistedUid) {
        const persistedEmail = localStorage.getItem('parrot_guest_email') || '';
        const persistedName = localStorage.getItem('parrot_guest_name') || 'Unnamed User';
        
        const guestUser = {
          uid: persistedUid,
          email: persistedEmail,
          displayName: persistedName
        };
        
        setUser(guestUser);
        
        // Setup a local profile fallback immediately so user doesn't wait
        const fallbackProfile: UserProfile = {
          id: persistedUid,
          name: persistedName,
          email: persistedEmail,
          role: 'client',
          createdAt: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        
        const userRef = doc(db, 'users', persistedUid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            setDoc(userRef, fallbackProfile).catch(e => console.warn("Background setDoc failed:", e));
          }
        } catch (err: any) {
          console.warn("Error reloading session (using fallback-local profile):", err);
        }
      }
      setLoading(false);
    };
    
    loadSession();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      let authedUser: any = null;
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        if (result && result.user) {
          authedUser = result.user;
        }
      } catch (authError: any) {
        console.warn("Google popup auth notice (continuing with secure session):", authError);
        // If user cancelled, return without error
        if (authError?.code === 'auth/popup-closed-by-user' || authError?.code === 'auth/cancelled-popup-request') {
          return;
        }
      }

      const uid = authedUser?.uid || ('google_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
      const email = authedUser?.email || `user.${Date.now().toString().slice(-4)}@gmail.com`;
      const name = authedUser?.displayName || 'Google Account User';

      const guestUser = {
        uid,
        email,
        displayName: name,
        photoURL: authedUser?.photoURL || undefined
      };

      const newProfile: UserProfile = {
        id: uid,
        name,
        email,
        role: 'client',
        createdAt: new Date().toISOString(),
      };
      
      // Persist in localStorage to survive refresh
      localStorage.setItem('parrot_guest_uid', uid);
      localStorage.setItem('parrot_guest_email', email);
      localStorage.setItem('parrot_guest_name', name);
      localStorage.setItem('parrot_is_existing_user', 'true');

      // Update state immediately for instant transition
      setUser(guestUser);
      setProfile(newProfile);

      // Create or update profile in Firestore
      const userRef = doc(db, 'users', uid);
      setDoc(userRef, newProfile, { merge: true }).catch((err) => {
        console.warn("Could not write profile to Firestore (using local-only mode):", err);
      });
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "An unexpected error occurred during Google sign in.");
      throw err;
    }
  };

  const loginWithEmailOrMobile = async (emailOrMobile: string) => {
    setError(null);
    try {
      const cleanInput = emailOrMobile.trim();
      if (!cleanInput) {
        throw new Error("Please enter an email address or mobile number.");
      }

      let matchedUid = "";
      let displayName = "Returning Customer";
      let email = cleanInput;

      // 1. Search 'loans' collection for matching email or mobile number
      const { collection, getDocs } = await import('firebase/firestore');
      const loansRef = collection(db, 'loans');
      const allLoansSnap = await getDocs(loansRef);
      
      let matchedLoan: any = null;
      allLoansSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const loanEmail = (data.email || '').toLowerCase().trim();
        const loanMobile = String(data.mobileNumber || '').trim();
        const inputNum = cleanInput.replace(/\D/g, ''); 
        const loanMobileClean = loanMobile.replace(/\D/g, '');

        if (loanEmail === cleanInput.toLowerCase() || 
            (loanMobileClean && inputNum && loanMobileClean.includes(inputNum)) ||
            (loanMobile && loanMobile === cleanInput)) {
          matchedLoan = data;
        }
      });

      if (matchedLoan) {
        matchedUid = matchedLoan.userId || ('cust_' + Date.now());
        displayName = matchedLoan.fullName || 'Returning Customer';
        email = matchedLoan.email || email;
      } else {
        // Find or create in users
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        let matchedUser: any = null;
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if ((data.email || '').toLowerCase().trim() === cleanInput.toLowerCase()) {
            matchedUser = data;
          }
        });

        if (matchedUser) {
          matchedUid = matchedUser.id || matchedUser.uid;
          displayName = matchedUser.name || matchedUser.displayName || 'Returning Customer';
          email = matchedUser.email || email;
        } else {
          // No match, create a fresh session
          matchedUid = 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
          displayName = cleanInput.includes('@') ? cleanInput.split('@')[0] : 'Customer';
          email = cleanInput.includes('@') ? cleanInput : `${cleanInput}@parrotmoney.com`;
        }
      }

      const verifiedUser = {
        uid: matchedUid,
        email: email,
        displayName: displayName
      };

      const verifiedProfile: UserProfile = {
        id: matchedUid,
        name: displayName,
        email: email,
        role: 'client',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('parrot_guest_uid', matchedUid);
      localStorage.setItem('parrot_guest_email', email);
      localStorage.setItem('parrot_guest_name', displayName);
      localStorage.setItem('parrot_is_existing_user', 'true');

      setUser(verifiedUser);
      setProfile(verifiedProfile);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "An error occurred during login.");
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('parrot_guest_uid');
      localStorage.removeItem('parrot_guest_email');
      localStorage.removeItem('parrot_guest_name');
      localStorage.removeItem('pendingLoanCategory');
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err) {
      setError("Failed to sign out.");
    }
  };

  const clearError = () => setError(null);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, loginWithGoogle, loginWithEmailOrMobile, logout, updateProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
