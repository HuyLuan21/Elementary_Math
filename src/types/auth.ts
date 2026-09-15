export type ProfileRole = 'parent' | 'child';

export interface UserProfile {
  id: string;
  name: string;
  role: ProfileRole;
  avatarColor: string;
  avatarIcon: string;
  grade?: string;
  pinCode?: string;
  age?: number;
}

export interface AuthContextType {
  userEmail: string | null;
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  login: (email: string) => void;
  selectProfile: (profile: UserProfile) => void;
  signOut: () => void;
  addProfile: (name: string, grade: string) => void;
}
