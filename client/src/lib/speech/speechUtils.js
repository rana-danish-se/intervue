/**
 * Browser speech helpers — safe for production (HTTPS) and localhost.
 * Web Speech API requires a secure context except http://localhost.
 */

export function isBrowserSpeechSupported() {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechRecognitionUsable() {
  if (typeof window === "undefined") return false;
  if (!isBrowserSpeechSupported()) return false;
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocalhost) return true;
  return window.isSecureContext === true;
}

/** Prefer device language for STT when it is English-based; else en-US. */
export function getPreferredSttLang() {
  if (typeof navigator === "undefined") return "en-US";
  const lang = navigator.language || "en-US";
  if (lang.toLowerCase().startsWith("en")) return lang;
  return "en-US";
}

/**
 * Opens the mic with noise suppression so the browser/OS DSP runs before Web Speech starts.
 * Safe no-op if getUserMedia is unavailable.
 */
export async function warmUpMicrophone() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    stream.getTracks().forEach((t) => t.stop());
  } catch {
    /* Permission denied or no device — Web Speech may still work or user will use typing fallback */
  }
}
