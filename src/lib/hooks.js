import { useState, useEffect, useCallback, useRef } from 'react';

/** A tiny localStorage hook — survives reloads, no library needed. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : typeof initialValue === 'function' ? initialValue() : initialValue;
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — the app keeps working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}

export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return matches;
}

// --- Accessibility preferences ------------------------------------------------

export const PREFS_KEY = 'vibetracker.prefs';

export const DEFAULT_PREFS = {
  theme: 'system', // system | dark | light | contrast
  cvd: 'none', // none | redgreen | blueyellow | mono
  textSize: 100, // 100 | 112.5 | 125 | 150 (% of the browser default)
  font: 'default', // default | readable
  motion: 'system', // system | reduce | full
  speechRate: 1,
  readContext: true,
  shortcuts: true, // single-key shortcuts can be turned off (WCAG 2.1.4)
  welcomeDismissed: false,
};

/** Apply preferences as attributes on <html>; index.css maps them to tokens. */
export function applyPrefs(p, systemLight) {
  const root = document.documentElement;
  const theme = p.theme === 'system' ? (systemLight ? 'light' : 'dark') : p.theme;
  root.dataset.theme = theme;
  root.dataset.cvd = p.cvd;
  root.dataset.font = p.font;
  root.dataset.motion = p.motion;
  root.style.fontSize = `${p.textSize}%`;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F5F1' : theme === 'contrast' ? '#000000' : '#0E1015');
}

export function usePrefs() {
  const [prefs, setPrefs] = useLocalStorage(PREFS_KEY, DEFAULT_PREFS);
  const merged = { ...DEFAULT_PREFS, ...prefs };
  const systemLight = useMediaQuery('(prefers-color-scheme: light)');
  useEffect(() => {
    applyPrefs(merged, systemLight);
  }, [merged.theme, merged.cvd, merged.font, merged.motion, merged.textSize, systemLight]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = useCallback((patch) => setPrefs((p) => ({ ...DEFAULT_PREFS, ...p, ...patch })), [setPrefs]);
  const reset = useCallback(
    () => setPrefs((p) => ({ ...DEFAULT_PREFS, welcomeDismissed: p.welcomeDismissed })),
    [setPrefs]
  );
  return [merged, update, reset];
}

// --- Read aloud (Web Speech API) ----------------------------------------------

export function useSpeech(rate = 1) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [speakingId, setSpeakingId] = useState(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang === 'en-GB') || voices.find((v) => v.lang?.startsWith('en')) || voices[0] || null;
    };
    pick();
    window.speechSynthesis.addEventListener?.('voiceschanged', pick);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', pick);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  /** Speak `text`; calling again with the same id while speaking stops it (toggle). */
  const speak = useCallback(
    (text, id = 'default') => {
      if (!supported) return false;
      const synth = window.speechSynthesis;
      if (speakingId === id && (synth.speaking || synth.pending)) {
        stop();
        return true;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'en-GB';
      u.rate = rate;
      u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      synth.speak(u);
      return true;
    },
    [supported, speakingId, rate, stop]
  );

  return { supported, speak, stop, speakingId };
}

/** True when focus is in a text field, so single-key shortcuts must not fire. */
export const isTyping = (el) =>
  !!el &&
  (el.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) ||
    el.getAttribute?.('role') === 'textbox');
