export interface BadgeAchievement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  earned_at: string;
}

export interface StickerAchievement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sound_url: string | null;
  unlocked_at: string;
}

export interface ProfileAchievements {
  summary: {
    badge_count: number;
    sticker_count: number;
  };
  badges: BadgeAchievement[];
  stickers: StickerAchievement[];
}

export interface ProfileAchievementsResponse {
  data: ProfileAchievements;
}
