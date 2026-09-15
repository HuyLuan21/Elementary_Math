import React, { createContext, useContext, useState } from 'react';
import { UserProfile, AuthContextType } from '../types/auth';

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'parent-1',
    name: 'Phụ Huynh',
    role: 'parent',
    avatarColor: '#4F46E5',
    avatarIcon: '👨‍👩‍👧‍👦',
    pinCode: '1234',
  },
  {
    id: 'kid-1',
    name: 'Bé Nam',
    role: 'child',
    grade: 'Lớp 1',
    avatarColor: '#E11D48',
    avatarIcon: '🦁',
    age: 6,
  },
  {
    id: 'kid-2',
    name: 'Bé An',
    role: 'child',
    grade: 'Lớp 3',
    avatarColor: '#0EA5E9',
    avatarIcon: '🦄',
    age: 8,
  },
  {
    id: 'kid-3',
    name: 'Bé Minh',
    role: 'child',
    grade: 'Lớp 5',
    avatarColor: '#10B981',
    avatarIcon: '🐼',
    age: 10,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);

  const login = (email: string) => {
    setUserEmail(email);
  };

  const selectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
  };

  const signOut = () => {
    setUserEmail(null);
    setActiveProfile(null);
  };

  const addProfile = (name: string, grade: string) => {
    const colors = ['#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    const icons = ['🐶', '🐱', '🦊', '🐯', '🐰'];
    const newProfile: UserProfile = {
      id: `kid-${profiles.length + 1}`,
      name: name || `Bé Mới ${profiles.length}`,
      role: 'child',
      grade: grade || 'Lớp 1',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      avatarIcon: icons[Math.floor(Math.random() * icons.length)],
      age: 7,
    };
    setProfiles((prev) => [...prev, newProfile]);
  };

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        activeProfile,
        profiles,
        login,
        selectProfile,
        signOut,
        addProfile,
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
