"use client";

import appSoundProfiles from "./app-sound-profiles.json";

export type AppSoundPlaybackResult = "played" | "blocked" | "unsupported";
export const APP_SOUND_ASSETS = {
  positiveDing: "/sounds/ding/ding.mp3",
} as const;

type AppSoundAssetName = keyof typeof APP_SOUND_ASSETS;
type AppSoundOscillatorProfileName = keyof typeof appSoundProfiles;
export type AppSoundProfileName = AppSoundAssetName | AppSoundOscillatorProfileName;

type AudioContextConstructor = typeof AudioContext;
type AudioElementConstructor = typeof Audio & { new (src?: string): HTMLAudioElement };

type AppSoundVoice = {
  oscillatorType: OscillatorType;
  frequencyHz: number;
  startsAtMs: number;
  durationMs: number;
  attackMs: number;
  releaseMs: number;
  peakGain: number;
};

export type AppSoundProfile = {
  name: AppSoundProfileName;
  totalDurationMs: number;
  voices: AppSoundVoice[];
};

const SILENCE_GAIN = 0.0001;

export const APP_SOUND_PROFILES = appSoundProfiles as Record<
  AppSoundOscillatorProfileName,
  AppSoundProfile
>;

function resolveAudioElementConstructor(): AudioElementConstructor | undefined {
  if (typeof window === "undefined" || typeof Audio === "undefined") return undefined;
  return Audio;
}

function resolveAudioContextConstructor():
  | (AudioContextConstructor & { new (): AudioContext })
  | undefined {
  if (typeof window === "undefined") return undefined;
  const audioWindow = window as Window &
    typeof globalThis & {
      webkitAudioContext?: AudioContextConstructor & { new (): AudioContext };
    };
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
}

function scheduleVoice(context: AudioContext, voice: AppSoundVoice) {
  const startTime = context.currentTime + voice.startsAtMs / 1000;
  const stopTime = startTime + voice.durationMs / 1000;
  const attackTime = startTime + voice.attackMs / 1000;
  const releaseTime = Math.max(attackTime, stopTime - voice.releaseMs / 1000);
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = voice.oscillatorType;
  oscillator.frequency.setValueAtTime(voice.frequencyHz, startTime);
  gain.gain.setValueAtTime(SILENCE_GAIN, startTime);
  gain.gain.exponentialRampToValueAtTime(voice.peakGain, attackTime);
  gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, releaseTime);
  gain.gain.setValueAtTime(SILENCE_GAIN, stopTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(stopTime);

  return oscillator;
}

function isOscillatorProfileName(
  profileName: AppSoundProfileName
): profileName is AppSoundOscillatorProfileName {
  return profileName in APP_SOUND_PROFILES;
}

function isAssetProfileName(profileName: AppSoundProfileName): profileName is AppSoundAssetName {
  return profileName in APP_SOUND_ASSETS;
}

async function playAppSoundAsset(src: string): Promise<AppSoundPlaybackResult> {
  const AudioElementConstructor = resolveAudioElementConstructor();
  if (!AudioElementConstructor) return "unsupported";

  try {
    const audio = new AudioElementConstructor(src);
    audio.preload = "auto";
    audio.currentTime = 0;
    await audio.play();
    return "played";
  } catch {
    return "blocked";
  }
}

export async function playAppSoundProfile(
  profileName: AppSoundProfileName
): Promise<AppSoundPlaybackResult> {
  if (isAssetProfileName(profileName)) {
    return playAppSoundAsset(APP_SOUND_ASSETS[profileName]);
  }

  if (!isOscillatorProfileName(profileName)) return "unsupported";

  const AudioContextConstructor = resolveAudioContextConstructor();
  if (!AudioContextConstructor) return "unsupported";

  try {
    const context = new AudioContextConstructor();
    if (context.state === "suspended") {
      await context.resume();
    }

    const profile = APP_SOUND_PROFILES[profileName];
    const oscillators = profile.voices.map((voice) => scheduleVoice(context, voice));
    const lastOscillator = oscillators[oscillators.length - 1];

    if (lastOscillator) {
      lastOscillator.addEventListener(
        "ended",
        () => {
          void context.close().catch(() => {
            // Audio is optional feedback; cleanup failures must not affect user work.
          });
        },
        { once: true }
      );
    }

    return "played";
  } catch {
    return "blocked";
  }
}
