// src/context/AuthContext.jsx - COMPLETE FIXED VERSION

import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase'; // Your Firebase config from src/firebase.js

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CREATE GOOGLE PROVIDER
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });

  // ✅ LOGOUT FUNCTION - THIS WAS MISSING!
  const logout = async () => {
    return signOut(auth);
  };

  // ✅ GOOGLE SIGN IN
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // ✅ EMAIL/PASSWORD SIGN IN
  const signInWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // ✅ EMAIL/PASSWORD SIGN UP
  const signUpWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ UPDATE VALUE OBJECT TO INCLUDE ALL FUNCTIONS:
  const value = {
    currentUser,
    logout,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
