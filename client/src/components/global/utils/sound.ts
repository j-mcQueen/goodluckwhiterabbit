let audioContext: AudioContext | null = null;
let track: MediaElementAudioSourceNode | null = null;
let audioElement: HTMLAudioElement | null = null;

export function initSound(audioEl: HTMLAudioElement) {
  if (audioEl && !track) {
    audioElement = audioEl;
    audioContext = new AudioContext();
    track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);
  } else return;
}

export async function unlock() {
  if (audioContext?.state === "suspended") {
    await audioContext.resume();
  }
}

export async function playSound() {
  await unlock();
  await audioElement?.play();
}
