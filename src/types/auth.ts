import { UserData } from '../services/authApi';

export type ProfileRole = 'parent' | 'child';

export interface ProfileInput {
  display_name: string;
  avatar_url: string;
  birth_date?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  role: ProfileRole;
  avatarColor: string;
  avatarIcon: string;
  avatarUrl?: string | null;
  totalStars?: number;
  birthDate?: string | null;
  grade?: string;
  age?: number;
}

export interface AuthContextType {
  userEmail: string | null;
  currentUser: UserData | null;
  authToken: string | null;
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  loadingProfiles: boolean;
  profilesError: string | null;
  isRestoring: boolean;
  login: (
    email: string,
    user?: UserData,
    token?: string,
    refreshToken?: string
  ) => Promise<void>;
  updateCurrentUser: (user: UserData) => void;
  selectProfile: (profile: UserProfile) => void;
  signOut: () => Promise<void>;
  addProfile: (profile: ProfileInput) => Promise<void>;
  editProfile: (profileId: string, profile: Partial<ProfileInput>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}
