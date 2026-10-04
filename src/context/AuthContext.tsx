import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, AuthContextType, ProfileInput } from '../types/auth';
import { UserData, setAuthToken as setApiAuthToken, authApi, onAuthFailure } from '../services/authApi';
import { profileApi, ApiProfileData } from '../services/profileApi';
import { storage } from '../utils/storage';
import { authStorage } from '../utils/authStorage';

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
  const [isRestoring, setIsRestoring] = useState<boolean>(true);

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

  const signOutInternal = useCallback(async (callBackend: boolean = true) => {
    const currentAccessToken = authToken || (await authStorage.getAccessToken());
    const currentRefreshToken = await authStorage.getRefreshToken();

    if (callBackend && (currentAccessToken || currentRefreshToken)) {
      try {
        await authApi.logout(currentAccessToken || undefined, currentRefreshToken || undefined);
      } catch (e) {
        console.warn('Lỗi khi gọi logout API:', e);
      }
    }

    setUserEmail(null);
    setCurrentUser(null);
    setAuthToken(null);
    setApiAuthToken(null);
    setActiveProfile(null);
    setProfiles([]);

    await Promise.all([
      authStorage.clearAuthTokens(),
      storage.removeItem('emath_auth_token'),
      storage.removeItem('emath_user_email'),
      storage.removeItem('emath_current_user'),
      storage.removeItem('emath_active_profile'),
    ]);
  }, [authToken]);

  const signOut = useCallback(async () => {
    await signOutInternal(true);
  }, [signOutInternal]);

  // Lắng nghe sự kiện Refresh Token thất bại từ Axios interceptor
  useEffect(() => {
    const unsubscribe = onAuthFailure(() => {
      signOutInternal(false);
    });
    return () => unsubscribe();
  }, [signOutInternal]);

  // Tự động khôi phục phiên đăng nhập khi mở lại app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await authStorage.init();
        let storedAccessToken = await authStorage.getAccessToken();
        const storedRefreshToken = await authStorage.getRefreshToken();
        const storedEmail = await storage.getItem('emath_user_email');
        const storedUser = await storage.getItem('emath_current_user');
        const storedProfile = await storage.getItem('emath_active_profile');

        // Fallback: nếu chưa có trong authStorage mà có trong legacy storage
        if (!storedAccessToken) {
          const legacyToken = await storage.getItem('emath_auth_token');
          if (legacyToken) {
            storedAccessToken = legacyToken;
            await authStorage.setAccessToken(legacyToken);
          }
        }

        if (storedEmail) setUserEmail(storedEmail);
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch {}
        }
        if (storedProfile) {
          try {
            setActiveProfile(JSON.parse(storedProfile));
          } catch {}
        }

        if (storedAccessToken || storedRefreshToken) {
          if (storedAccessToken) {
            setAuthToken(storedAccessToken);
            setApiAuthToken(storedAccessToken);
          }

          try {
            // Xác thực token với backend qua /auth/me
            // Nếu access token hết hạn nhưng refresh token hợp lệ, interceptor sẽ tự refresh
            const me = await authApi.getMe(storedAccessToken || undefined);
            setCurrentUser(me);
            await storage.setItem('emath_current_user', JSON.stringify(me));

            const latestToken = (await authStorage.getAccessToken()) || storedAccessToken;
            if (latestToken) {
              setAuthToken(latestToken);
              setApiAuthToken(latestToken);
              await fetchProfiles(latestToken, me);
            }
          } catch (verifyError) {
            console.warn('Phiên đăng nhập không hợp lệ hoặc refresh thất bại:', verifyError);
            await signOutInternal(false);
          }
        }
      } catch (e) {
        console.warn('Lỗi khôi phục phiên đăng nhập:', e);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [signOutInternal]);

  const login = async (
    email: string,
    user?: UserData,
    token?: string,
    refreshToken?: string
  ) => {
    setUserEmail(email);
    await storage.setItem('emath_user_email', email);

    if (user) {
      setCurrentUser(user);
      await storage.setItem('emath_current_user', JSON.stringify(user));
    }

    if (token) {
      setAuthToken(token);
      setApiAuthToken(token);
      await authStorage.setAccessToken(token);
      await storage.setItem('emath_auth_token', token);
    }

    if (refreshToken) {
      await authStorage.setRefreshToken(refreshToken);
    }

    if (token) {
      await fetchProfiles(token, user);
    }
  };

  const refreshProfiles = async () => {
    const activeToken = authToken || (await authStorage.getAccessToken());
    if (activeToken) {
      await fetchProfiles(activeToken, currentUser);
    }
  };

  const selectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    storage.setItem('emath_active_profile', JSON.stringify(profile));
  };

  const updateCurrentUser = (user: UserData) => {
    setCurrentUser(user);
    storage.setItem('emath_current_user', JSON.stringify(user));
  };

  const addProfile = async (profile: ProfileInput) => {
    const activeToken = authToken || (await authStorage.getAccessToken());
    if (!activeToken) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    const createdProfile = await profileApi.createProfile(activeToken, profile);
    setProfiles((current) => {
      const childProfiles = current.filter((item) => item.role === 'child');
      const mappedProfile = mapBackendProfile(createdProfile, childProfiles.length);
      return [...current.filter((item) => item.role === 'parent'), ...childProfiles, mappedProfile];
    });
    setProfilesError(null);
  };

  const editProfile = async (profileId: string, profile: Partial<ProfileInput>) => {
    const activeToken = authToken || (await authStorage.getAccessToken());
    if (!activeToken) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    const updatedProfile = await profileApi.updateProfile(activeToken, profileId, profile);
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
    const activeToken = authToken || (await authStorage.getAccessToken());
    if (!activeToken) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    await profileApi.deleteProfile(activeToken, profileId);
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
        isRestoring,
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
