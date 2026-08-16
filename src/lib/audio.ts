export function speakText(text: string, lang = 'en-US'): { cancel: () => void } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { cancel: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown symbols and code tags for cleaner speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_#•]/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.05;

  // Try to pick a natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    v => v.lang.startsWith(lang.slice(0, 2)) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Siri'))
  ) || voices.find(v => v.lang.startsWith(lang.slice(0, 2)));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => window.speechSynthesis.cancel()
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
