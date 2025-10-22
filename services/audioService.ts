// A service to generate sound effects using the Web Audio API.
// Heavily inspired by the sharp, digital, and weighty sound design of the Metal Gear Solid series.

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

const init = () => {
    if (audioContext === null && typeof window !== 'undefined') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            masterGain = audioContext.createGain();
            masterGain.gain.setValueAtTime(0.4, audioContext.currentTime); // Global volume
            masterGain.connect(audioContext.destination);
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }
};

const createDistortion = (amount: number = 20) => {
    if (!audioContext) return null;
    const distortion = audioContext.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        const x = i * 2 / 255 - 1;
        curve[i] = (3 + amount) * x * 20 * Math.PI / (Math.PI + amount * Math.abs(x));
    }
    distortion.curve = curve;
    distortion.oversample = '4x';
    return distortion;
}


export const audioService = {
    init,
    // A digital "glitch" sound for key presses.
    playKeyPress: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;
        const duration = 0.06;

        // Gain envelope - very sharp and quick
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        gainNode.connect(masterGain);

        // Oscillator for the tone
        const osc = audioContext.createOscillator();
        osc.type = 'square';
        // Start at a high pitch with slight randomness
        const startFreq = 2000 + Math.random() * 500;
        osc.frequency.setValueAtTime(startFreq, now);
        // Quickly ramp down to a lower pitch
        osc.frequency.exponentialRampToValueAtTime(startFreq / 2, now + duration);
        osc.connect(gainNode);

        osc.start(now);
        osc.stop(now + duration);
    },
    // Harsh, dissonant, multi-layered "alert" buzz with digital distortion.
    playError: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        
        const distortion = createDistortion(40);
        if(!distortion) return;
        
        gainNode.connect(distortion);
        distortion.connect(masterGain);

        const osc1 = audioContext.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(160, now);
        osc1.detune.setValueAtTime(-10, now);
        osc1.connect(gainNode);

        const osc2 = audioContext.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(160, now);
        osc2.detune.setValueAtTime(10, now);
        osc2.connect(gainNode);
        
        osc1.start(now);
        osc1.stop(now + 0.25);
        osc2.start(now);
        osc2.stop(now + 0.25);
    },
    // The classic MGS "codec call" sound for UI interactions.
    playUIClick: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        gainNode.connect(masterGain);
        
        const osc = audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        osc.connect(gainNode);

        osc.start(now);
        osc.stop(now + 0.1);
    },
    // A quick, clear sound for file/folder opening
    playFileOpen: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        gainNode.connect(masterGain);

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.connect(gainNode);
        
        osc.start(now);
        osc.stop(now + 0.1);
    },
    // High-pitched, urgent tick for timers, like a bomb timer.
    playTimerTick: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        gainNode.connect(masterGain);

        const osc = audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(3000, now);
        osc.connect(gainNode);
        
        osc.start(now);
        osc.stop(now + 0.08);
    },
    // A more complex, melodic and thematic sequence for mission start.
    playMissionStart: () => {
         if (!audioContext || !masterGain) return;
         const now = audioContext.currentTime;
         
         const freqs = [783.99, 932.33, 1174.66]; // G5, A#5, D6
         
         freqs.forEach((freq, i) => {
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.1);
            gainNode.connect(masterGain);

            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            osc.connect(gainNode);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.1);
         });
    },
    // A triumphant, resonant sequence with a bit of harmony.
    playMissionComplete: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;

        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        freqs.forEach((freq, i) => {
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.4, now + i * 0.1 + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.2);
            gainNode.connect(masterGain);

            const osc = audioContext.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            osc.connect(gainNode);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
         });
    },
    // A powerful, "fat", rising sound achieved by layering detuned oscillators and a filter sweep.
    playLevelUp: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;
        const duration = 1.5;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 15;
        filter.frequency.setValueAtTime(100, now);
        filter.frequency.exponentialRampToValueAtTime(6000, now + duration * 0.8);
        
        gainNode.connect(filter);
        filter.connect(masterGain);
        
        // Layer three slightly detuned sawtooth waves for a fat sound
        [-10, 0, 10].forEach(detune => {
             const osc = audioContext.createOscillator();
             osc.type = 'sawtooth';
             osc.frequency.setValueAtTime(220, now); // A3
             osc.frequency.exponentialRampToValueAtTime(440, now + duration); // A4
             osc.detune.value = detune;
             osc.connect(gainNode);
             osc.start(now);
             osc.stop(now + duration);
        });
    },
    // A low, resonant "thump" sound for selecting a mission.
    playMissionSelect: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        gainNode.connect(masterGain);

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        osc.connect(gainNode);

        osc.start(now);
        osc.stop(now + 0.3);
    },
    // A chaotic, digital static burst for the CORRUPTED modifier.
    playCorruptionGlitch: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;

        const bufferSize = audioContext.sampleRate * 0.05; // 50ms of noise
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(gainNode);
        gainNode.connect(masterGain);
        noise.start(now);
    },
    // A positive chime for successful CAPTCHA round.
    playCaptchaRoundSuccess: () => {
        if (!audioContext || !masterGain) return;
        const now = audioContext.currentTime;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        gainNode.connect(masterGain);

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now); // C6
        osc.connect(gainNode);
        
        const osc2 = audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now); // E6
        osc2.detune.setValueAtTime(5, now);
        osc2.connect(gainNode);
        
        osc.start(now);
        osc.stop(now + 0.2);
        osc2.start(now);
        osc2.stop(now + 0.2);
    }
};