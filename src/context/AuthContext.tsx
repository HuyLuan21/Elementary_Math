import React, { createContext, useContext, useState } from 'react';
import { UserProfile, AuthContextType } from '../types/auth';
import { UserData, setAuthToken as setApiAuthToken } from '../services/authApi';
import { profileApi, ApiProfileData } from '../services/profileApi';

const AVATAR_COLORS = ['#E11D48', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
const AVATAR_ICONS = ['🦁', '🦄', '🐼', '🐶', '🐱', '🦊', '🐯', '🐰'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false);

  const mapBackendProfiles = (apiProfiles: ApiProfileData[], user?: UserData | null): UserProfile[] => {
    const parentName = (user?.full_name && user.full_name.trim()) || 'Phụ Huynh';
    const parentProfile: UserProfile = {
      id: 'parent-main',
      name: parentName,
      role: 'parent',
      avatarColor: '#4F46E5',
      avatarIcon: '👨‍👩‍👧‍👦',
      pinCode: '1234',
    };

    const kidProfiles: UserProfile[] = apiProfiles.map((p, index) => ({
      id: p.id,
      name: p.display_name,
      role: 'child',
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      avatarIcon: AVATAR_ICONS[index % AVATAR_ICONS.length],
      avatarUrl: p.avatar_url,
      totalStars: p.total_stars,
      birthDate: p.birth_date,
      grade: 'Lớp 1',
      pinCode: '1234',
    }));

    return [parentProfile, ...kidProfiles];
  };

  const fetchProfiles = async (token: string, user?: UserData | null) => {
    setLoadingProfiles(true);
    try {
      const apiProfiles = await profileApi.getProfiles(token);
      const mapped = mapBackendProfiles(apiProfiles, user || currentUser);
      setProfiles(mapped);
    } catch (error) {
      console.warn('Lỗi khi tải hồ sơ từ backend:', error);
      // Fallback: ít nhất có profile phụ huynh
      setProfiles(mapBackendProfiles([], user || currentUser));
    } finally {
      setLoadingProfiles(false);
    }
  };

  const login = async (email: string, user?: UserData, token?: string) => {
    setUserEmail(email);
    if (user) {
      setCurrentUser(user);
    }
    if (token) {
      setAuthToken(token);
      setApiAuthToken(token);
      await fetchProfiles(token, user);
    }
  };

  const refreshProfiles = async () => {
    if (authToken) {
      await fetchProfiles(authToken, currentUser);
    }
  };

  const selectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
  };

  const signOut = () => {
    setUserEmail(null);
    setCurrentUser(null);
    setAuthToken(null);
    setApiAuthToken(null);
    setActiveProfile(null);
    setProfiles([]);
  };

  const addProfile = async (name: string, grade?: string, avatarUrl?: string) => {
    const kidName = name.trim() || `Bé Mới ${profiles.length}`;
    if (authToken) {
      try {
        await profileApi.createProfile(authToken, {
          display_name: kidName,
          avatar_url: avatarUrl || `/avatars/kid.png`,
        });
        await refreshProfiles();
      } catch (error) {
        console.error('Lỗi khi tạo hồ sơ mới:', error);
        throw error;
      }
    }
  };

  const editProfile = async (profileId: string, name: string, avatarUrl?: string) => {
    if (authToken) {
      try {
        await profileApi.updateProfile(authToken, profileId, {
          display_name: name.trim(),
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        });
        await refreshProfiles();
      } catch (error) {
        console.error('Lỗi khi cập nhật hồ sơ:', error);
        throw error;
      }
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (authToken) {
      try {
        await profileApi.deleteProfile(authToken, profileId);
        await refreshProfiles();
      } catch (error) {
        console.error('Lỗi khi xóa hồ sơ:', error);
        throw error;
      }
    }
  };

  const verifyParentPin = (inputPin: string): boolean => {
    const validPin = '1234';
    return inputPin.trim() === validPin;
  };

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        currentUser,
        authToken,
        activeProfile,
        profiles,
        loadingProfiles,
        login,
        selectProfile,
        signOut,
        addProfile,
        editProfile,
        deleteProfile,
        verifyParentPin,
        refreshProfiles,
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
