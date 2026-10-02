import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  usersList: AppUser[];
  createUserByAdmin: (user: Omit<AppUser, 'createdAt'>) => Promise<void>;
  updateUserByAdmin: (uid: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUserByAdmin: (uid: string) => Promise<void>;
  isFirebaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Default mock users in case firestore has not populated them yet
  const defaultInitialUsers: AppUser[] = [
    {
      uid: 'admin-default-01',
      email: 'admin@campusgo.edu',
      displayName: 'System Administrator',
      role: 'admin',
      phone: '+91 98480 00001',
      department: 'Campus Transit Authority',
      createdAt: Date.now() - 30 * 86400000,
      status: 'active',
    },
    {
      uid: 'driver-default-01',
      email: 'rajesh.driver@campusgo.edu',
      displayName: 'Rajesh Kumar',
      role: 'driver',
      phone: '+91 98480 23145',
      assignedBusNumber: 'BUS-01',
      department: 'Fleet Operations',
      createdAt: Date.now() - 20 * 86400000,
      status: 'active',
    },
    {
      uid: 'student-default-01',
      email: 'aanya.sharma@college.edu',
      displayName: 'Aanya Sharma',
      role: 'student',
      phone: '+91 91234 56789',
      department: 'Computer Science (21CS1044)',
      createdAt: Date.now() - 10 * 86400000,
      status: 'active',
    },
  ];

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as AppUser);
          } else {
            // First time or admin assigned
            const fallbackProfile: AppUser = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Campus User',
              role: user.email?.includes('admin') ? 'admin' : user.email?.includes('driver') ? 'driver' : 'student',
              createdAt: Date.now(),
              status: 'active',
            };
            await setDoc(userDocRef, fallbackProfile);
            setUserProfile(fallbackProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore, using auth fallback', err);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Campus User',
            role: user.email?.includes('admin') ? 'admin' : 'student',
            createdAt: Date.now(),
            status: 'active',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to the full users collection (for Admin User Management)
  useEffect(() => {
    try {
      const usersCol = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppUser[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ uid: docSnap.id, ...(docSnap.data() as any) });
            });
            setUsersList(list);
          } else {
            // Initialize with default users into Firestore if collection is empty
            setUsersList(defaultInitialUsers);
            defaultInitialUsers.forEach(async (u) => {
              try {
                await setDoc(doc(db, 'users', u.uid), u);
              } catch (e) {
                // ignore
              }
            });
          }
          setIsFirebaseConnected(true);
        },
        (error) => {
          console.warn('Firestore users collection snapshot warning (fallback to local state):', error);
          setUsersList(defaultInitialUsers);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase snapshot init error', e);
      setUsersList(defaultInitialUsers);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string, role: UserRole, phone?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const newProfile: AppUser = {
        uid: cred.user.uid,
        email,
        displayName: name,
        role,
        phone: phone || '',
        createdAt: Date.now(),
        status: 'active',
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
  };

  // Admin User CRUD methods
  const createUserByAdmin = async (user: Omit<AppUser, 'createdAt'>) => {
    const fullUser: AppUser = {
      ...user,
      createdAt: Date.now(),
    };
    try {
      await setDoc(doc(db, 'users', fullUser.uid), fullUser);
    } catch (err) {
      console.warn('Error saving user to Firestore:', err);
    }
    setUsersList((prev) => {
      const filtered = prev.filter((u) => u.uid !== fullUser.uid);
      return [fullUser, ...filtered];
    });
  };

  const updateUserByAdmin = async (uid: string, updates: Partial<AppUser>) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (err) {
      console.warn('Error updating user in Firestore:', err);
    }
    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u))
    );
    if (userProfile && userProfile.uid === uid) {
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteUserByAdmin = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      console.warn('Error deleting user from Firestore:', err);
    }
    setUsersList((prev) => prev.filter((u) => u.uid !== uid));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        signup,
        logout,
        usersList,
        createUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
        isFirebaseConnected,
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
