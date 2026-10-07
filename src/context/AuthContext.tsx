import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { AppUser, UserRole, SecurityAuditLog } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUserRole: (newRole: UserRole) => void;
  usersList: AppUser[];
  createUserByAdmin: (user: Omit<AppUser, 'createdAt'>) => Promise<void>;
  updateUserByAdmin: (uid: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUserByAdmin: (uid: string) => Promise<void>;
  isFirebaseConnected: boolean;
  auditLogs: SecurityAuditLog[];
  recordAuditLog: (log: SecurityAuditLog) => void;
  clearAuditLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default predefined users for instant demo access and fallback
const DEFAULT_INITIAL_USERS: AppUser[] = [
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
    email: 'driver@campusgo.edu',
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
    email: 'student@campusgo.edu',
    displayName: 'Aanya Sharma',
    role: 'student',
    phone: '+91 91234 56789',
    department: 'Computer Science (21CS1044)',
    createdAt: Date.now() - 10 * 86400000,
    status: 'active',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load cached user profile to prevent any flicker upon page refresh
  const [userProfile, setUserProfile] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_cached_user');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_users_list');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return DEFAULT_INITIAL_USERS;
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Security compliance audit logs saved in AuthContext session data
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_security_audit_logs');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {}
    }
    return [];
  });

  // Sync audit logs with session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cambusgo_security_audit_logs', JSON.stringify(auditLogs));
      } catch (e) {}
    }
  }, [auditLogs]);

  // Method to record an audit log in session data
  const recordAuditLog = useCallback((log: SecurityAuditLog) => {
    setAuditLogs((prev) => {
      // Deduplicate immediate rapid consecutive attempts (within 5 seconds) for the same user and route
      if (prev.length > 0) {
        const latest = prev[0];
        if (
          latest.attemptedRoute === log.attemptedRoute &&
          latest.userRole === log.userRole &&
          latest.userEmail === log.userEmail &&
          Date.now() - latest.timestamp < 5000
        ) {
          return prev;
        }
      }
      return [log, ...prev].slice(0, 100);
    });

    // Also attempt optional persistent Firestore audit sync if database is connected
    try {
      const auditDocRef = doc(db, 'security_audits', log.id);
      setDoc(auditDocRef, log).catch(() => {});
    } catch (e) {
      // Keep session-only if Firestore is unavailable
    }
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cambusgo_security_audit_logs');
      } catch (e) {}
    }
  }, []);

  // Sync userProfile with localStorage for refresh persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (userProfile) {
        try {
          localStorage.setItem('cambusgo_cached_user', JSON.stringify(userProfile));
        } catch (e) {}
      } else {
        localStorage.removeItem('cambusgo_cached_user');
      }
    }
  }, [userProfile]);

  // Sync usersList with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cambusgo_users_list', JSON.stringify(usersList));
      } catch (e) {}
    }
  }, [usersList]);

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as AppUser;
            setUserProfile(data);
          } else {
            // First time or admin assigned
            const fallbackProfile: AppUser = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Campus User',
              role: user.email?.includes('admin')
                ? 'admin'
                : user.email?.includes('driver')
                ? 'driver'
                : 'student',
              createdAt: Date.now(),
              status: 'active',
            };
            await setDoc(userDocRef, fallbackProfile).catch(() => {});
            setUserProfile(fallbackProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore, using auth fallback', err);
          if (!userProfile) {
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Campus User',
              role: user.email?.includes('admin') ? 'admin' : user.email?.includes('driver') ? 'driver' : 'student',
              createdAt: Date.now(),
              status: 'active',
            });
          }
        }
      } else {
        // If Firebase says not logged in, but we have a demo user cached from offline sign in,
        // only clear if it wasn't a manual demo login or if explicitly signed out
        const hasSession = localStorage.getItem('cambusgo_cached_user');
        if (!hasSession) {
          setUserProfile(null);
        }
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
            setUsersList(DEFAULT_INITIAL_USERS);
            DEFAULT_INITIAL_USERS.forEach(async (u) => {
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
          setIsFirebaseConnected(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase snapshot init error', e);
      setIsFirebaseConnected(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if matching one of our standard demo accounts for fast reliable sign-in
    const demoUser = DEFAULT_INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        try {
          const snap = await getDoc(doc(db, 'users', cred.user.uid));
          if (snap.exists()) {
            setUserProfile(snap.data() as AppUser);
            return;
          }
        } catch (e) {}
        // Fallback user profile from Firebase auth
        const role: UserRole = cleanEmail.includes('admin')
          ? 'admin'
          : cleanEmail.includes('driver')
          ? 'driver'
          : 'student';
        const prof: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cred.user.displayName || cleanEmail.split('@')[0],
          role,
          createdAt: Date.now(),
          status: 'active',
        };
        setUserProfile(prof);
      }
    } catch (err: any) {
      // If Firebase failed (e.g. user was not pre-registered in Firebase Auth, or offline),
      // allow sign in with demo accounts or check locally registered users
      const localFound = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
      if (demoUser || localFound) {
        const matched = demoUser || localFound;
        if (matched) {
          setUserProfile(matched);
          return;
        }
      }
      throw err;
    }
  };

  const signup = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    phone?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();

    // Validate duplicate registration in local usersList
    const duplicate = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      throw new Error('auth/email-already-in-use');
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
        const newProfile: AppUser = {
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: name,
          role,
          phone: phone || '',
          createdAt: Date.now(),
          status: 'active',
        };
        await setDoc(doc(db, 'users', cred.user.uid), newProfile).catch(() => {});
        setUserProfile(newProfile);
        setUsersList((prev) => [newProfile, ...prev.filter((u) => u.uid !== newProfile.uid)]);
        return;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('auth/email-already-in-use')) {
        throw err;
      }
      // If network / offline fallback
      const offlineUid = 'user-' + Date.now();
      const offlineProfile: AppUser = {
        uid: offlineUid,
        email: cleanEmail,
        displayName: name,
        role,
        phone: phone || '',
        createdAt: Date.now(),
        status: 'active',
      };
      setUserProfile(offlineProfile);
      setUsersList((prev) => [offlineProfile, ...prev]);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setUserProfile(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cambusgo_cached_user');
    }
  };

  const switchUserRole = (newRole: UserRole) => {
    if (userProfile) {
      const updated: AppUser = { ...userProfile, role: newRole };
      setUserProfile(updated);
      try {
        updateDoc(doc(db, 'users', userProfile.uid), { role: newRole }).catch(() => {});
      } catch (e) {}
    } else {
      // Create guest profile with this role
      const guest: AppUser = {
        uid: 'guest-' + newRole,
        email: `${newRole}@cambusgo.edu`,
        displayName: newRole === 'admin' ? 'Fleet Admin' : newRole === 'driver' ? 'Driver Kumar' : 'Student Guest',
        role: newRole,
        createdAt: Date.now(),
        status: 'active',
      };
      setUserProfile(guest);
    }
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
        switchUserRole,
        usersList,
        createUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
        isFirebaseConnected,
        auditLogs,
        recordAuditLog,
        clearAuditLogs,
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
