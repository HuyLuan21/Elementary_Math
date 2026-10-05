import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

// Bật âm thanh trên iOS ngay cả khi gạt nút im lặng (Silent Switch)
if (Platform.OS !== "web") {
  try {
    setAudioModeAsync({
      playsInSilentMode: true,
    }).catch(() => {});
  } catch (e) {}
}

const LESSON_SOUNDS = {
  correct: require("../../assets/Duolingo Correct - QuickSounds.com.mp3"),
  wrong: require("../../assets/Duolingo-Wronggg.mp3"),
  complete: require("../../assets/Duolingo-End-of-Lesson.mp3"),
};

export type SoundEffectType = keyof typeof LESSON_SOUNDS;

const playerCache: Record<string, any> = {};

/**
 * Phát hiệu ứng âm thanh (Đúng / Sai / Hoàn thành bài học)
 */
export const playSoundEffect = async (type: SoundEffectType) => {
  try {
    const soundSource = LESSON_SOUNDS[type];
    if (!soundSource) return;

    // 1. Web HTML5 Audio (Chạy mượt mà 100% trên Web)
    if (Platform.OS === "web" && typeof window !== "undefined" && (window as any).Audio) {
      try {
        const audioUri =
          typeof soundSource === "string"
            ? soundSource
            : soundSource?.default || soundSource?.uri || soundSource;
        const audio = new (window as any).Audio(audioUri);
        audio.volume = 1.0;
        audio.play().catch(() => {});
        return;
      } catch (err) {}
    }

    // 2. Mobile (iOS / Android Expo Go): Sử dụng expo-audio
    if (Platform.OS !== "web") {
      try {
        // Đảm bảo âm thanh phát được ngay cả khi gạt nút im lặng trên iPhone
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: "mixWithOthers",
        }).catch(() => {});

        if (!playerCache[type]) {
          playerCache[type] = createAudioPlayer(soundSource);
        }

        const player = playerCache[type];
        if (player) {
          try {
            await player.seekTo(0);
          } catch (e) {}
          player.play();
        }
      } catch (nativeErr) {
        try {
          const freshPlayer = createAudioPlayer(soundSource);
          freshPlayer.play();
          playerCache[type] = freshPlayer;
        } catch (e) {}
      }
    }
  } catch (error) {
    // Đảm bảo an toàn tuyệt đối, không gián đoạn người dùng
  }
};


