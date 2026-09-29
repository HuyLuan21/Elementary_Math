import { UserData } from '../services/authApi';

export type ProfileRole = 'parent' | 'child';

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
  pinCode?: string;
  age?: number;
}

export interface AuthContextType {
  userEmail: string | null;
  currentUser: UserData | null;
  authToken: string | null;
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  loadingProfiles: boolean;
  login: (email: string, user?: UserData, token?: string) => Promise<void>;
  selectProfile: (profile: UserProfile) => void;
  signOut: () => void;
  addProfile: (name: string, grade?: string, avatarUrl?: string) => Promise<void>;
  editProfile: (profileId: string, name: string, avatarUrl?: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  verifyParentPin: (pin: string) => boolean;
  refreshProfiles: () => Promise<void>;
}
