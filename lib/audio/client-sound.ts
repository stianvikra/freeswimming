"use client";

export type AppSoundPlaybackResult = "played" | "blocked" | "unsupported";
export type AppSoundProfileName =
  | "softSuccessChime"
  | "positiveDing"
  | "tapComplete"
  | "timerComplete";

type AudioContextConstructor = typeof AudioContext;

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

export const APP_SOUND_PROFILES: Record<AppSoundProfileName, AppSoundProfile> = {
  softSuccessChime: {
    name: "softSuccessChime",
    totalDurationMs: 1480,
    voices: [
      {
        oscillatorType: "sine",
        frequencyHz: 432,
        startsAtMs: 0,
        durationMs: 980,
        attackMs: 110,
        releaseMs: 680,
        peakGain: 0.014,
      },
      {
        oscillatorType: "sine",
        frequencyHz: 540,
        startsAtMs: 260,
        durationMs: 960,
        attackMs: 120,
        releaseMs: 700,
        peakGain: 0.012,
      },
      {
        oscillatorType: "sine",
        frequencyHz: 648,
        startsAtMs: 620,
        durationMs: 720,
        attackMs: 120,
        releaseMs: 540,
        peakGain: 0.009,
      },
    ],
  },
  positiveDing: {
    name: "positiveDing",
    totalDurationMs: 360,
    voices: [
      {
        oscillatorType: "sine",
        frequencyHz: 659.25,
        startsAtMs: 0,
        durationMs: 170,
        attackMs: 12,
        releaseMs: 132,
        peakGain: 0.04,
      },
      {
        oscillatorType: "sine",
        frequencyHz: 987.77,
        startsAtMs: 96,
        durationMs: 210,
        attackMs: 14,
        releaseMs: 168,
        peakGain: 0.032,
      },
    ],
  },
  tapComplete: {
    name: "tapComplete",
    totalDurationMs: 260,
    voices: [
      {
        oscillatorType: "sine",
        frequencyHz: 587.33,
        startsAtMs: 0,
        durationMs: 110,
        attackMs: 10,
        releaseMs: 88,
        peakGain: 0.028,
      },
      {
        oscillatorType: "sine",
        frequencyHz: 783.99,
        startsAtMs: 82,
        durationMs: 135,
        attackMs: 12,
        releaseMs: 108,
        peakGain: 0.022,
      },
    ],
  },
  timerComplete: {
    name: "timerComplete",
    totalDurationMs: 380,
    voices: [
      {
        oscillatorType: "triangle",
        frequencyHz: 440,
        startsAtMs: 0,
        durationMs: 135,
        attackMs: 16,
        releaseMs: 102,
        peakGain: 0.03,
      },
      {
        oscillatorType: "sine",
        frequencyHz: 659.25,
        startsAtMs: 108,
        durationMs: 185,
        attackMs: 18,
        releaseMs: 145,
        peakGain: 0.026,
      },
      {
        oscillatorType: "sine",
        frequencyHz: 880,
        startsAtMs: 232,
        durationMs: 96,
        attackMs: 12,
        releaseMs: 76,
        peakGain: 0.018,
      },
    ],
  },
};

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

export async function playAppSoundProfile(
  profileName: AppSoundProfileName
): Promise<AppSoundPlaybackResult> {
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
