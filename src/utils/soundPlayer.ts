import { Platform } from "react-native";
import * as Speech from "expo-speech";

// Thư viện âm thanh động vật thật chất lượng cao (Google Actions Sound Library & Public CDN)
export const REAL_ANIMAL_SOUNDS: Record<
  string,
  { name: string; soundUrl: string; fallbackText: string; emoji: string }
> = {
  cat: {
    name: "Mèo con",
    soundUrl: "https://actions.google.com/sounds/v1/animals/cat_purr_and_meow.ogg",
    fallbackText: "Meo meo! Mèo con xin chào bé!",
    emoji: "🐱",
  },
  dog: {
    name: "Cún vàng",
    soundUrl: "https://actions.google.com/sounds/v1/animals/dog_barking.ogg",
    fallbackText: "Gâu gâu! Cún vàng chúc mừng bé!",
    emoji: "🐶",
  },
  chicken: {
    name: "Gà con",
    soundUrl: "https://actions.google.com/sounds/v1/animals/chickens_clucking.ogg",
    fallbackText: "Chiếp chiếp! Bé học chăm chỉ quá!",
    emoji: "🐥",
  },
  duck: {
    name: "Vịt vàng",
    soundUrl: "https://actions.google.com/sounds/v1/animals/duck_quack.ogg",
    fallbackText: "Cạp cạp! Vịt con bơi lội tung tăng!",
    emoji: "🦆",
  },
  frog: {
    name: "Ếch xanh",
    soundUrl: "https://actions.google.com/sounds/v1/animals/frog_croak.ogg",
    fallbackText: "Ộp ộp! Ếch xanh nhảy xa!",
    emoji: "🐸",
  },
  elephant: {
    name: "Chú voi",
    soundUrl: "https://actions.google.com/sounds/v1/animals/elephant_trumpet.ogg",
    fallbackText: "Voi con khỏe mạnh xin chào bé!",
    emoji: "🐘",
  },
  cow: {
    name: "Bò sữa",
    soundUrl: "https://actions.google.com/sounds/v1/animals/cow_moo.ogg",
    fallbackText: "Ùm bò! Bò sữa cho bé nhiều năng lượng!",
    emoji: "🐮",
  },
  sheep: {
    name: "Cừu bông",
    soundUrl: "https://actions.google.com/sounds/v1/animals/sheep_bleat.ogg",
    fallbackText: "Be be! Cừu bông mềm mại!",
    emoji: "🐑",
  },
  rabbit: {
    name: "Thỏ trắng",
    soundUrl: "https://actions.google.com/sounds/v1/cartoon/boing_spring.ogg",
    fallbackText: "Thỏ con nhảy nhót! Boing boing!",
    emoji: "🐰",
  },
  bird: {
    name: "Chim hót",
    soundUrl: "https://actions.google.com/sounds/v1/animals/birds_singing.ogg",
    fallbackText: "Líu lo líu lo! Chim hót chào ngày mới!",
    emoji: "🐦",
  },
};

let currentHtmlAudio: any = null;

/**
 * Phát âm thanh động vật thật
 * @param animalKey Key của con vật (cat, dog, duck, chicken, frog, elephant, rabbit, etc.)
 * @param customSpeech (Tùy chọn) Lời nhắn bằng giọng nói kèm theo
 */
export const playRealAnimalSound = async (
  animalKey: string,
  customSpeech?: string
) => {
  const key = animalKey.toLowerCase();
  const animal =
    REAL_ANIMAL_SOUNDS[key] ||
    Object.values(REAL_ANIMAL_SOUNDS).find((a) =>
      a.name.toLowerCase().includes(key)
    ) ||
    REAL_ANIMAL_SOUNDS.cat;

  // 1. Dừng giọng nói & âm thanh trước đó
  try {
    Speech.stop();
  } catch (e) {}

  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
    } catch (e) {}
    currentHtmlAudio = null;
  }

  // 2. Nếu trên Web: Phát trực tiếp file âm thanh thật qua HTML5 Audio
  if (Platform.OS === "web" && typeof window !== "undefined" && (window as any).Audio) {
    try {
      currentHtmlAudio = new (window as any).Audio(animal.soundUrl);
      currentHtmlAudio.volume = 0.9;
      currentHtmlAudio.play().catch((err: any) => {
        console.warn("Web audio autoplay blocked or error:", err);
      });

      // Nếu có custom speech, phát sau khi tiếng động vật vang lên
      if (customSpeech) {
        setTimeout(() => {
          Speech.speak(customSpeech, {
            language: "vi-VN",
            pitch: 1.2,
            rate: 1.05,
          });
        }, 1200);
      }
      return;
    } catch (err) {
      console.warn("HTML5 audio playback error:", err);
    }
  }

  // 3. Nếu trên Native (Android / iOS): Thử tải expo-av nếu có, hoặc phát giọng nói sinh động
  try {
    // Dynamic import expo-av nếu người dùng đã cài
    const ExpoAv = require("expo-av");
    if (ExpoAv && ExpoAv.Audio && ExpoAv.Audio.Sound) {
      const { sound } = await ExpoAv.Audio.Sound.createAsync(
        { uri: animal.soundUrl },
        { shouldPlay: true, volume: 1.0 }
      );
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      if (customSpeech) {
        setTimeout(() => {
          Speech.speak(customSpeech, {
            language: "vi-VN",
            pitch: 1.2,
            rate: 1.05,
          });
        }, 1200);
      }
      return;
    }
  } catch (e) {
    // expo-av chưa được cài trên mobile => Dùng giọng đọc mô phỏng tiếng kêu vui nhộn
  }

  // 4. Fallback giọng đọc nếu không có audio engine
  Speech.speak(customSpeech || animal.fallbackText, {
    language: "vi-VN",
    pitch: 1.25,
    rate: 1.05,
  });
};
