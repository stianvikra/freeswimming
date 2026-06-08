import { afterEach, describe, expect, it, vi } from "vitest";
import {
  APP_SOUND_ASSETS,
  APP_SOUND_ASSET_VOLUMES,
  APP_SOUND_PROFILES,
  playAppSoundProfile,
} from "@/lib/audio/client-sound";

type MockAudioElement = {
  src?: string;
  preload: string;
  volume: number;
  currentTime: number;
  play: () => Promise<void>;
};

function installAudioElementMock(options?: { playRejects?: boolean }) {
  const audio = {
    instances: [] as MockAudioElement[],
    play: vi.fn<() => Promise<void>>(() =>
      options?.playRejects ? Promise.reject(new Error("blocked")) : Promise.resolve()
    ),
  };

  class MockAudio implements MockAudioElement {
    src?: string;
    preload = "";
    volume = -1;
    currentTime = -1;
    play = audio.play;

    constructor(src?: string) {
      this.src = src;
      audio.instances.push(this);
    }
  }

  vi.stubGlobal("Audio", MockAudio);
  return audio;
}

function installAudioContextMock(options?: { state?: AudioContextState; resumeRejects?: boolean }) {
  const audio = {
    start: vi.fn(),
    stop: vi.fn(),
    resume: vi.fn(() =>
      options?.resumeRejects ? Promise.reject(new Error("blocked")) : Promise.resolve()
    ),
    close: vi.fn(() => Promise.resolve()),
    oscillatorConnect: vi.fn(),
    gainConnect: vi.fn(),
    setFrequency: vi.fn(),
    setGain: vi.fn(),
    rampGain: vi.fn(),
    addEndedListener: vi.fn(),
  };

  class MockAudioContext {
    state = options?.state ?? "running";
    currentTime = 4;
    destination = {};
    resume = audio.resume;
    close = audio.close;

    createOscillator() {
      return {
        type: "sine",
        frequency: {
          setValueAtTime: audio.setFrequency,
        },
        connect: audio.oscillatorConnect,
        start: audio.start,
        stop: audio.stop,
        addEventListener: audio.addEndedListener,
      };
    }

    createGain() {
      return {
        gain: {
          setValueAtTime: audio.setGain,
          exponentialRampToValueAtTime: audio.rampGain,
        },
        connect: audio.gainConnect,
      };
    }
  }

  vi.stubGlobal("AudioContext", MockAudioContext);
  return audio;
}

describe("client sound profiles", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps the shared success chime calm, soft, and away from the old harsh glide", () => {
    const profile = APP_SOUND_PROFILES.softSuccessChime;

    expect(profile.totalDurationMs).toBeGreaterThanOrEqual(1200);
    expect(profile.totalDurationMs).toBeLessThanOrEqual(1600);
    expect(profile.voices.map((voice) => voice.frequencyHz)).toEqual([432, 540, 648]);
    expect(profile.voices.map((voice) => voice.frequencyHz)).not.toContain(528);
    expect(Math.max(...profile.voices.map((voice) => voice.peakGain))).toBeLessThanOrEqual(0.014);
    expect(Math.min(...profile.voices.map((voice) => voice.attackMs))).toBeGreaterThanOrEqual(80);
    expect(Math.min(...profile.voices.map((voice) => voice.releaseMs))).toBeGreaterThanOrEqual(500);
    expect(profile.voices.every((voice) => voice.oscillatorType === "sine")).toBe(true);
  });

  it("keeps the Habits positive ding bound to the approved bundled mp3 asset", () => {
    expect(APP_SOUND_ASSETS.positiveDing).toBe("/sounds/ding/ding.mp3");
    expect(APP_SOUND_ASSET_VOLUMES.positiveDing).toBe(0.15);
  });

  it("keeps generated oscillator profiles distinct for non-asset sounds", () => {
    const tapProfile = APP_SOUND_PROFILES.tapComplete;
    const timerProfile = APP_SOUND_PROFILES.timerComplete;

    expect(tapProfile.voices).toHaveLength(2);
    expect(timerProfile.voices).toHaveLength(3);
    expect(timerProfile.totalDurationMs).toBeGreaterThan(tapProfile.totalDurationMs);
    expect(tapProfile.voices.map((voice) => voice.frequencyHz)).not.toEqual(
      timerProfile.voices.map((voice) => voice.frequencyHz)
    );
  });

  it("schedules every voice in the requested profile", async () => {
    const audio = installAudioContextMock();
    const profile = APP_SOUND_PROFILES.tapComplete;

    await expect(playAppSoundProfile("tapComplete")).resolves.toBe("played");

    expect(audio.start).toHaveBeenCalledTimes(profile.voices.length);
    expect(audio.stop).toHaveBeenCalledTimes(profile.voices.length);
    expect(audio.setFrequency).toHaveBeenCalledWith(587.33, expect.any(Number));
    expect(audio.setFrequency).toHaveBeenCalledWith(783.99, expect.any(Number));
    expect(audio.rampGain).toHaveBeenCalledWith(0.028, expect.any(Number));
    expect(audio.addEndedListener).toHaveBeenCalledWith("ended", expect.any(Function), {
      once: true,
    });
  });

  it("plays the Habits positive ding from the bundled mp3 asset", async () => {
    const elementAudio = installAudioElementMock();
    const contextAudio = installAudioContextMock();

    await expect(playAppSoundProfile("positiveDing")).resolves.toBe("played");

    expect(elementAudio.instances).toHaveLength(1);
    expect(elementAudio.instances[0]).toMatchObject({
      src: APP_SOUND_ASSETS.positiveDing,
      preload: "auto",
      volume: APP_SOUND_ASSET_VOLUMES.positiveDing,
      currentTime: 0,
    });
    expect(elementAudio.play).toHaveBeenCalledTimes(1);
    expect(contextAudio.start).not.toHaveBeenCalled();
  });

  it("reports blocked playback when the bundled positive ding asset cannot play", async () => {
    const audio = installAudioElementMock({ playRejects: true });

    await expect(playAppSoundProfile("positiveDing")).resolves.toBe("blocked");

    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it("reports blocked playback without scheduling sound when resume fails", async () => {
    const audio = installAudioContextMock({ state: "suspended", resumeRejects: true });

    await expect(playAppSoundProfile("tapComplete")).resolves.toBe("blocked");

    expect(audio.resume).toHaveBeenCalledTimes(1);
    expect(audio.start).not.toHaveBeenCalled();
  });
});
