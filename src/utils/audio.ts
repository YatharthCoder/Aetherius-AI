// Web Audio API Sound Generator for cyber-tech futuristic study node (Aetherius)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume if suspended (browser security policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Play a subtle high-tech futuristic click sound
let lastClickTime = 0;
export function playClickSound() {
  const now = Date.now();
  if (now - lastClickTime < 35) return; // Prevent dual triggers from double-bindings within 35ms
  lastClickTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  // Fast frequency sweep for high-tech click
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

// Play a lovely cyberpunk ambient hover click
export function playHoverSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.02, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

// Play a gorgeous success chime (ascending notes)
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playNote = (freq: number, delay: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + duration);
  };

  // Celestial high-tech pentatonic scale
  playNote(523.25, 0, 0.3);     // C5
  playNote(587.33, 0.06, 0.3);  // D5
  playNote(659.25, 0.12, 0.35); // E5
  playNote(783.99, 0.18, 0.4);  // G5
  playNote(987.77, 0.24, 0.65); // B5
}

// Play an error/recourse alarm (gentle dual-tone warning)
export function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'sine';

  osc1.frequency.setValueAtTime(150, now);
  osc1.frequency.linearRampToValueAtTime(120, now + 0.15);
  osc2.frequency.setValueAtTime(152, now);
  osc2.frequency.linearRampToValueAtTime(122, now + 0.15);

  gain1.gain.setValueAtTime(0.04, now);
  gain1.gain.linearRampToValueAtTime(0.001, now + 0.2);

  gain2.gain.setValueAtTime(0.04, now);
  gain2.gain.linearRampToValueAtTime(0.001, now + 0.2);

  // Bandpass filter to make it sound like a high-tech terminal buzzer, not annoying
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 1.0;

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(filter);
  gain2.connect(filter);
  filter.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(now + 0.2);
  osc2.stop(now + 0.2);
}

// Play simulation/boardroom loading warp swoosh
export function playWarpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.6);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(now + 0.6);
}

// Play an additive, high-fidelity cyber-power-up intro chime
export function playAppOpenSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Warm low-frequency power-up sweep
  const powerOsc = ctx.createOscillator();
  const powerGain = ctx.createGain();
  powerOsc.type = 'sine';
  powerOsc.frequency.setValueAtTime(65, now);
  powerOsc.frequency.exponentialRampToValueAtTime(260, now + 0.85);

  powerGain.gain.setValueAtTime(0, now);
  powerGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
  powerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  powerOsc.connect(powerGain);
  powerGain.connect(ctx.destination);
  powerOsc.start(now);
  powerOsc.stop(now + 0.85);

  // 2. Addictive shimmering digital chime cascade
  const chimes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
  chimes.forEach((freq, index) => {
    const delay = index * 0.065;
    const duration = 0.7 - (index * 0.05);
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now + delay);
    osc.stop(now + delay + duration);
  });
}

// Background Focus Waves Synthesis Engine
interface FocusWaveState {
  type: 'binaural' | 'white' | 'ocean' | 'brown' | 'rain' | null;
  nodes: any[];
  masterGain: GainNode | null;
  volume: number;
}

const waveState: FocusWaveState = {
  type: null,
  nodes: [],
  masterGain: null,
  volume: 0.35
};

export function stopFocusWaves() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Gently ramp down master gain to avoid clicks
  if (waveState.masterGain) {
    try {
      waveState.masterGain.gain.setValueAtTime(waveState.masterGain.gain.value, ctx.currentTime);
      waveState.masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Error ramping down focus waves:", e);
    }
  }

  // Stop after ramp
  const nodesToStop = [...waveState.nodes];
  const masterToDisconnect = waveState.masterGain;

  setTimeout(() => {
    nodesToStop.forEach(n => {
      try {
        n.stop();
      } catch (e) {}
      try {
        n.disconnect();
      } catch (e) {}
    });
    if (masterToDisconnect) {
      try {
        masterToDisconnect.disconnect();
      } catch (e) {}
    }
  }, 160);

  waveState.type = null;
  waveState.nodes = [];
  waveState.masterGain = null;
}

export function setFocusWavesVolume(volume: number) {
  waveState.volume = volume;
  if (waveState.masterGain && audioCtx) {
    try {
      // Direct assignment or ramp
      waveState.masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
    } catch (e) {}
  }
}

export function getActiveFocusWaveType(): 'binaural' | 'white' | 'ocean' | 'brown' | 'rain' | null {
  return waveState.type;
}

export function startFocusWaves(type: 'binaural' | 'white' | 'ocean' | 'brown' | 'rain', volume: number = 0.35) {
  // 1. Stop any currently playing wave first
  stopFocusWaves();

  const ctx = getAudioContext();
  if (!ctx) return;

  waveState.type = type;
  waveState.volume = volume;

  // Create master gain for this wave session
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5); // Warm fade-in
  masterGain.connect(ctx.destination);
  waveState.masterGain = masterGain;

  const activeNodes: any[] = [];

  if (type === 'binaural') {
    // Left ear 110 Hz, Right ear 116 Hz -> 6 Hz Theta Binaural Wave
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    const gainL = ctx.createGain();
    const gainR = ctx.createGain();

    oscL.type = 'sine';
    oscL.frequency.value = 110;

    oscR.type = 'sine';
    oscR.frequency.value = 116;

    gainL.gain.value = 0.55;
    gainR.gain.value = 0.55;

    // Create Channel Merger for Stereo routing
    const merger = ctx.createChannelMerger(2);

    oscL.connect(gainL);
    oscR.connect(gainR);

    gainL.connect(merger, 0, 0); // left
    gainR.connect(merger, 0, 1); // right

    merger.connect(masterGain);

    oscL.start();
    oscR.start();

    activeNodes.push(oscL, oscR, gainL, gainR, merger);

    // Optional subtle backing low drone for deep resonance
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'triangle';
    drone.frequency.value = 55; // sub-bass harmonic
    droneGain.gain.value = 0.12;
    drone.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();
    activeNodes.push(drone, droneGain);

  } else if (type === 'white') {
    // Mathematical White Noise synthesis
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Filter to make it smoother and more comfortable (grey noise curve)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 650;
    filter.Q.value = 0.6;

    noiseNode.connect(filter);
    filter.connect(masterGain);

    noiseNode.start();
    activeNodes.push(noiseNode, filter);

  } else if (type === 'ocean') {
    // Lowpass filtered white noise modulated with extremely slow LFO
    const bufferSize = 3 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    // LFO modulator
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09; // ocean tide cycle (approx 11 seconds)
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180; // swing frequency between 140 Hz and 500 Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseNode.connect(filter);
    filter.connect(masterGain);

    lfo.start();
    noiseNode.start();
    activeNodes.push(noiseNode, filter, lfo, lfoGain);
  } else if (type === 'brown') {
    // Brown Noise: deep, cozy rumble
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain multiplier for deep volume parity
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    noiseNode.connect(filter);
    filter.connect(masterGain);

    noiseNode.start();
    activeNodes.push(noiseNode, filter);

  } else if (type === 'rain') {
    // Rain Sound: Pinkish/Brown noise with random high-pass water drop crackles
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.12 * white)) / 1.12;
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'lowpass';
    bandpass.frequency.value = 900;

    noiseNode.connect(bandpass);
    bandpass.connect(masterGain);

    noiseNode.start();
    activeNodes.push(noiseNode, bandpass);

    // Random water drops timer loop
    const dropletInterval = setInterval(() => {
      if (waveState.type !== 'rain' || !audioCtx) {
        clearInterval(dropletInterval);
        return;
      }
      if (Math.random() > 0.4) {
        const dropOsc = audioCtx.createOscillator();
        const dropGain = audioCtx.createGain();
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(700 + Math.random() * 1100, audioCtx.currentTime);
        dropOsc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.04);
        
        dropGain.gain.setValueAtTime(0.003 + Math.random() * 0.008, audioCtx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
        
        dropOsc.connect(dropGain);
        dropGain.connect(masterGain);
        dropOsc.start();
        dropOsc.stop(audioCtx.currentTime + 0.05);
      }
    }, 150);

    // Store droplets cleanup timer as a dynamic property to clear
    (noiseNode as any)._dropletTimer = dropletInterval;
  }

  waveState.nodes = activeNodes;
}


