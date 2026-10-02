// Web Audio API Ambient Chill Broadcast Synthesizer for Emergency Fallback / Montage
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lfoOsc: OscillatorNode | null = null;
let chordOscillators: OscillatorNode[] = [];
let isPlaying = false;

// Warm major-7th broadcast chords (frequencies in Hz)
const CHORD_PROGRESSION = [
  [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
  [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
  [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
  [196.00, 246.94, 293.66, 349.23], // G7 (G3, B3, D4, F4)
];

let chordInterval: number | null = null;
let currentChordIndex = 0;

export function startAmbientBroadcastMusic(volumePercent: number = 70) {
  if (isPlaying) {
    if (masterGain && audioCtx) {
      masterGain.gain.setTargetAtTime((volumePercent / 100) * 0.15, audioCtx.currentTime, 0.1);
    }
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Master Gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime((volumePercent / 100) * 0.15, audioCtx.currentTime);

    // Filter for warm, chill analog lo-fi texture
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(680, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    // Slow LFO for gentle ambient movement
    lfoOsc = audioCtx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(0.2, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(120, audioCtx.currentTime);
    lfoOsc.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfoOsc.start();

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Function to trigger a chord
    const playChord = (freqs: number[]) => {
      if (!audioCtx) return;
      // Stop previous
      chordOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      chordOscillators = [];

      freqs.forEach((freq, idx) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        // Alternating triangle and sine for soft chill texture
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        // Soft attack
        oscGain.gain.linearRampToValueAtTime(0.25 / freqs.length, audioCtx.currentTime + 1.2);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        chordOscillators.push(osc);
      });
    };

    // Play first chord
    playChord(CHORD_PROGRESSION[0]);
    currentChordIndex = 0;

    // Cycle chords every 3.5 seconds
    chordInterval = window.setInterval(() => {
      currentChordIndex = (currentChordIndex + 1) % CHORD_PROGRESSION.length;
      playChord(CHORD_PROGRESSION[currentChordIndex]);
    }, 3500);

    isPlaying = true;
  } catch (err) {
    console.warn('AudioContext playback restricted by user gesture policy:', err);
  }
}

export function stopAmbientBroadcastMusic() {
  if (!isPlaying) return;

  try {
    if (chordInterval) {
      clearInterval(chordInterval);
      chordInterval = null;
    }

    if (masterGain && audioCtx) {
      masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.4);
    }

    setTimeout(() => {
      chordOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      chordOscillators = [];

      if (lfoOsc) {
        try {
          lfoOsc.stop();
          lfoOsc.disconnect();
        } catch (e) {}
        lfoOsc = null;
      }
      isPlaying = false;
    }, 450);
  } catch (e) {
    isPlaying = false;
  }
}

export function setAmbientMusicVolume(volumePercent: number) {
  if (masterGain && audioCtx) {
    const val = Math.max(0, Math.min(1, (volumePercent / 100) * 0.2));
    masterGain.gain.setTargetAtTime(val, audioCtx.currentTime, 0.1);
  }
}
