"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type InstallRequestResult =
  | "accepted"
  | "dismissed"
  | "ios-instructions"
  | "mac-safari-instructions"
  | "unsupported"
  | "already-installed";

type InstallContextValue = {
  isInstalled: boolean;
  isIOS: boolean;
  isMacSafari: boolean;
  canNativePrompt: boolean;
  canInstall: boolean;
  requestInstall: () => Promise<InstallRequestResult>;
};

const InstallContext = createContext<InstallContextValue | null>(null);

function detectStandaloneMode() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function isIOSUserAgent(userAgent: string, platform: string, maxTouchPoints: number) {
  const ua = userAgent.toLowerCase();
  const iOSByUA = /iphone|ipad|ipod/.test(ua);
  const iPadOSDesktopUA = platform === "MacIntel" && maxTouchPoints > 1;
  return iOSByUA || iPadOSDesktopUA;
}

export function isMacSafariUserAgent(userAgent: string, platform: string, maxTouchPoints: number) {
  const ua = userAgent.toLowerCase();
  const isIOS = isIOSUserAgent(userAgent, platform, maxTouchPoints);
  const isMacPlatform = /mac/i.test(platform);
  const hasSafariToken = ua.includes("safari");
  const hasExcludedBrowserToken = /(crios|chrome|chromium|edg|edge|firefox|fxios|opr|opera)/.test(
    ua
  );
  return !isIOS && isMacPlatform && hasSafariToken && !hasExcludedBrowserToken;
}

function detectIOSDevice() {
  if (typeof window === "undefined") return false;
  return isIOSUserAgent(
    window.navigator.userAgent,
    window.navigator.platform,
    window.navigator.maxTouchPoints
  );
}

function detectMacSafari() {
  if (typeof window === "undefined") return false;
  return isMacSafariUserAgent(
    window.navigator.userAgent,
    window.navigator.platform,
    window.navigator.maxTouchPoints
  );
}

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => detectStandaloneMode());
  const [isIOS] = useState(() => detectIOSDevice());
  const [isMacSafari] = useState(() => detectMacSafari());
  const [canNativePrompt, setCanNativePrompt] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChanged = () => {
      setIsInstalled(detectStandaloneMode());
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onDisplayModeChanged);
    } else {
      media.addListener(onDisplayModeChanged);
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", onDisplayModeChanged);
      } else {
        media.removeListener(onDisplayModeChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in window.navigator)) return;
    window.navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      deferredPromptRef.current = promptEvent;
      setCanNativePrompt(true);
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanNativePrompt(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const requestInstall = useCallback(async (): Promise<InstallRequestResult> => {
    if (isInstalled) {
      return "already-installed";
    }

    const promptEvent = deferredPromptRef.current;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        deferredPromptRef.current = null;
        setCanNativePrompt(false);
        return choice.outcome === "accepted" ? "accepted" : "dismissed";
      } catch {
        deferredPromptRef.current = null;
        setCanNativePrompt(false);
        return "unsupported";
      }
    }

    if (isIOS) return "ios-instructions";
    if (isMacSafari) return "mac-safari-instructions";
    return "unsupported";
  }, [isInstalled, isIOS, isMacSafari]);

  const value = useMemo<InstallContextValue>(() => {
    const canInstall = !isInstalled && (canNativePrompt || isIOS || isMacSafari);
    return {
      isInstalled,
      isIOS,
      isMacSafari,
      canNativePrompt,
      canInstall,
      requestInstall,
    };
  }, [canNativePrompt, isIOS, isInstalled, isMacSafari, requestInstall]);

  return <InstallContext.Provider value={value}>{children}</InstallContext.Provider>;
}

export function useInstallContext() {
  const context = useContext(InstallContext);
  if (!context) {
    throw new Error("useInstallContext must be used within an InstallProvider.");
  }
  return context;
}
