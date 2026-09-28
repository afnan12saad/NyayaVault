import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, createUserProfile, logAuditEvent } from '../services/dbService';
import { seedDemoDataIfEmpty, DEMO_USERS } from '../services/seedData';
import { UserProfile, UserRole, DepartmentName } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  department: DepartmentName;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (data: {
    fullName: string;
    email: string;
    pass: string;
    officerId: string;
    department: DepartmentName;
    designation: string;
    role: UserRole;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchDemoRole: (roleKey: keyof typeof DEMO_USERS) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize and check Firestore connection & seed demo data
  useEffect(() => {
    seedDemoDataIfEmpty();
  }, []);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoMode(false);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Default fallback profile for new email user
            const fallback: UserProfile = {
              uid: user.uid,
              fullName: user.displayName || user.email?.split('@')[0] || 'Officer',
              email: user.email || '',
              officerId: `ID-${user.uid.substring(0, 6).toUpperCase()}`,
              department: 'Police Investigation',
              designation: 'Special Officer',
              role: 'INVESTIGATING OFFICER',
              isActive: true,
              createdAt: new Date().toISOString()
            };
            await createUserProfile(fallback);
            setUserProfile(fallback);
          }
        } catch (e) {
          console.error('Failed to load user profile from Firestore:', e);
        }
      } else if (!isDemoMode) {
        // Fallback default: Start in demo Investigating Officer role so reviewer can instantly explore
        const defaultDemo = DEMO_USERS.investigator;
        setUserProfile(defaultDemo);
        setIsDemoMode(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const refreshProfile = async () => {
    if (currentUser) {
      const p = await getUserProfile(currentUser.uid);
      if (p) setUserProfile(p);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfile(res.user.uid);
      if (profile) {
        setUserProfile(profile);
        await logAuditEvent('LOGIN', 'USER', res.user.uid, profile.fullName, {
          result: 'SUCCESS',
          details: `User logged in with role ${profile.role}`
        });
      }
      setIsDemoMode(false);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    fullName: string;
    email: string;
    pass: string;
    officerId: string;
    department: DepartmentName;
    designation: string;
    role: UserRole;
  }) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      await updateProfile(res.user, { displayName: data.fullName });
      const newProfile: UserProfile = {
        uid: res.user.uid,
        fullName: data.fullName,
        email: data.email,
        officerId: data.officerId,
        department: data.department,
        designation: data.designation,
        role: data.role,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      await createUserProfile(newProfile);
      setUserProfile(newProfile);
      setIsDemoMode(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (userProfile) {
      await logAuditEvent('LOGOUT', 'USER', userProfile.uid, userProfile.fullName, {
        result: 'SUCCESS',
        details: 'User logged out'
      });
    }
    await firebaseSignOut(auth);
    // Switch to Viewer demo role on sign out
    setUserProfile(DEMO_USERS.viewer);
    setIsDemoMode(true);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const switchDemoRole = (roleKey: keyof typeof DEMO_USERS) => {
    const selected = DEMO_USERS[roleKey];
    if (selected) {
      setUserProfile(selected);
      setIsDemoMode(true);
      logAuditEvent('DEMO_ROLE_SWITCH', 'USER', selected.uid, selected.fullName, {
        result: 'SUCCESS',
        details: `Switched operational context to demo role: ${selected.role} (${selected.department})`
      });
    }
  };

  const role: UserRole = userProfile?.role || 'VIEWER';
  const department: DepartmentName = userProfile?.department || 'Police Investigation';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        department,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        switchDemoRole,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
