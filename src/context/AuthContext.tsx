import React, { createContext, useContext, useState } from 'react';
import { UserProfile, AuthContextType, ProfileInput } from '../types/auth';
import { UserData, setAuthToken as setApiAuthToken } from '../services/authApi';
import { profileApi, ApiProfileData } from '../services/profileApi';
import { storage } from '../utils/storage';

const AVATAR_COLORS = ['#DDF2FF', '#FFF0BE', '#DDF7E5', '#E4F3FA', '#FFF6D9'];
const AVATAR_ICONS = ['🦁', '🦄', '🐼', '🐶', '🐱', '🦊', '🐯', '🐰'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  const mapBackendProfile = (profile: ApiProfileData, index: number): UserProfile => ({
    id: profile.id,
    name: profile.display_name,
    role: 'child',
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    avatarIcon:
      profile.avatar_url && AVATAR_ICONS.includes(profile.avatar_url)
        ? profile.avatar_url
        : AVATAR_ICONS[index % AVATAR_ICONS.length],
    avatarUrl: profile.avatar_url,
    totalStars: profile.total_stars,
    birthDate: profile.birth_date,
  });

  // Tự động khôi phục phiên đăng nhập và hồ sơ bé đang chọn khi F5 / mở lại app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await storage.getItem('emath_auth_token');
        const storedEmail = await storage.getItem('emath_user_email');
        const storedUser = await storage.getItem('emath_current_user');
        const storedProfile = await storage.getItem('emath_active_profile');

        if (storedToken) {
          setAuthToken(storedToken);
          setApiAuthToken(storedToken);
        }
        if (storedEmail) setUserEmail(storedEmail);
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch (e) {}
        }
        if (storedProfile) {
          try {
            setActiveProfile(JSON.parse(storedProfile));
          } catch (e) {}
        }

        if (storedToken) {
          const u = storedUser ? JSON.parse(storedUser) : null;
          await fetchProfiles(storedToken, u);
        }
      } catch (e) {
        console.warn('Lỗi khôi phục phiên đăng nhập:', e);
      }
    };

    restoreSession();
  }, []);

  const mapBackendProfiles = (apiProfiles: ApiProfileData[], user?: UserData | null): UserProfile[] => {
    const parentName = (user?.full_name && user.full_name.trim()) || 'Phụ Huynh';
    const parentProfile: UserProfile = {
      id: 'parent-main',
      name: parentName,
      role: 'parent',
      avatarColor: '#DDF2FF',
      avatarIcon: '👨‍👩‍👧‍👦',
    };

    const kidProfiles = apiProfiles.map(mapBackendProfile);

    return [parentProfile, ...kidProfiles];
  };

  const fetchProfiles = async (token: string, user?: UserData | null) => {
    setLoadingProfiles(true);
    try {
      const apiProfiles = await profileApi.getProfiles(token);
      const mapped = mapBackendProfiles(apiProfiles, user || currentUser);
      setProfilesError(null);
      setProfiles(mapped);
      setActiveProfile((current) => {
        if (!current) return null;
        const refreshedProfile = mapped.find((profile) => profile.id === current.id);
        if (refreshedProfile) return refreshedProfile;
        if (current.role === 'child') {
          return mapped.find((profile) => profile.role === 'child') || null;
        }
        return mapped.find((profile) => profile.role === 'parent') || null;
      });
    } catch (error: unknown) {
      console.warn('Lỗi khi tải hồ sơ từ backend:', error);
      setProfilesError(
        error instanceof Error ? error.message : 'Không thể tải danh sách hồ sơ.'
      );
      setProfiles((current) =>
        current.length ? current : mapBackendProfiles([], user || currentUser)
      );
    } finally {
      setLoadingProfiles(false);
    }
  };

  const login = async (email: string, user?: UserData, token?: string) => {
    setUserEmail(email);
    await storage.setItem('emath_user_email', email);

    if (user) {
      setCurrentUser(user);
      await storage.setItem('emath_current_user', JSON.stringify(user));
    }
    if (token) {
      setAuthToken(token);
      setApiAuthToken(token);
      await storage.setItem('emath_auth_token', token);
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
    storage.setItem('emath_active_profile', JSON.stringify(profile));
  };

  const updateCurrentUser = (user: UserData) => {
    setCurrentUser(user);
  };

  const signOut = () => {
    setUserEmail(null);
    setCurrentUser(null);
    setAuthToken(null);
    setApiAuthToken(null);
    setActiveProfile(null);
    setProfiles([]);
    storage.removeItem('emath_auth_token');
    storage.removeItem('emath_user_email');
    storage.removeItem('emath_current_user');
    storage.removeItem('emath_active_profile');
  };

  const addProfile = async (profile: ProfileInput) => {
    if (!authToken) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    const createdProfile = await profileApi.createProfile(authToken, profile);
    setProfiles((current) => {
      const childProfiles = current.filter((item) => item.role === 'child');
      const mappedProfile = mapBackendProfile(createdProfile, childProfiles.length);
      return [...current.filter((item) => item.role === 'parent'), ...childProfiles, mappedProfile];
    });
    setProfilesError(null);
  };

  const editProfile = async (profileId: string, profile: Partial<ProfileInput>) => {
    if (!authToken) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    const updatedProfile = await profileApi.updateProfile(authToken, profileId, profile);
    setProfiles((current) => {
      const childIndex = current
        .filter((item) => item.role === 'child')
        .findIndex((item) => item.id === profileId);
      if (childIndex < 0) return current;
      const mappedProfile = mapBackendProfile(updatedProfile, childIndex);
      return current.map((item) => (item.id === profileId ? mappedProfile : item));
    });
    setActiveProfile((current) =>
      current?.id === profileId
        ? mapBackendProfile(
            updatedProfile,
            profiles.filter((item) => item.role === 'child').findIndex((item) => item.id === profileId)
          )
        : current
    );
  };

  const deleteProfile = async (profileId: string) => {
    if (!authToken) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    await profileApi.deleteProfile(authToken, profileId);
    const remainingChildren = profiles.filter(
      (item) => item.role === 'child' && item.id !== profileId
    );
    setProfiles((current) => current.filter((item) => item.id !== profileId));
    setActiveProfile((active) =>
      active?.id === profileId ? remainingChildren[0] || null : active
    );
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
        profilesError,
        login,
        selectProfile,
        signOut,
        addProfile,
        editProfile,
        deleteProfile,
        refreshProfiles,
        updateCurrentUser,
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
