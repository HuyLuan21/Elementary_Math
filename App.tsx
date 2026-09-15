import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { UserProfile } from './src/types/auth';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileSelectionScreen } from './src/screens/ProfileSelectionScreen';
import { HomeScreen } from './src/screens/HomeScreen';

// Initial preloaded profiles for the account
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'parent-1',
    name: 'Phụ Huynh',
    role: 'parent',
    avatarColor: '#4F46E5', // Indigo blue
    avatarIcon: '👨‍👩‍👧‍👦',
    pinCode: '1234',
  },
  {
    id: 'kid-1',
    name: 'Bé Nam',
    role: 'child',
    grade: 'Lớp 1',
    avatarColor: '#E11D48', // Rose red
    avatarIcon: '🦁',
    age: 6,
  },
  {
    id: 'kid-2',
    name: 'Bé An',
    role: 'child',
    grade: 'Lớp 3',
    avatarColor: '#0EA5E9', // Sky blue
    avatarIcon: '🦄',
    age: 8,
  },
  {
    id: 'kid-3',
    name: 'Bé Minh',
    role: 'child',
    grade: 'Lớp 5',
    avatarColor: '#10B981', // Emerald green
    avatarIcon: '🐼',
    age: 10,
  },
];

export default function App() {
  const [screen, setScreen] = useState<'login' | 'profiles' | 'home'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setScreen('profiles');
  };

  const handleSelectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    setScreen('home');
  };

  const handleSwitchProfile = () => {
    setScreen('profiles');
  };

  const handleSignOut = () => {
    setActiveProfile(null);
    setUserEmail('');
    setScreen('login');
  };

  const handleAddProfile = () => {
    const newId = `kid-${profiles.length + 1}`;
    const colors = ['#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    const icons = ['🐶', '🐱', '🦊', '🐯', '🐰'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newProfile: UserProfile = {
      id: newId,
      name: `Bé Mới ${profiles.length}`,
      role: 'child',
      grade: 'Lớp 2',
      avatarColor: randomColor,
      avatarIcon: randomIcon,
      age: 7,
    };

    setProfiles([...profiles, newProfile]);
    Alert.alert('Thành công', `Đã thêm hồ sơ học viên mới: ${newProfile.name}`);
  };

  return (
    <>
      <StatusBar style="light"/>
      {screen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {screen === 'profiles' && (
        <ProfileSelectionScreen
          userEmail={userEmail || 'phuhuynh@mathkids.edu.vn'}
          profiles={profiles}
          onSelectProfile={handleSelectProfile}
          onAddProfileRequest={handleAddProfile}
          onSignOut={handleSignOut}
        />
      )}

      {screen === 'home' && activeProfile && (
        <HomeScreen
          activeProfile={activeProfile}
          onSwitchProfile={handleSwitchProfile}
          onSignOut={handleSignOut}
        />
      )}
    </>
  );
}
