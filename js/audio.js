// js/audio.js
// Sistema de audio: música ambiental sintetizada con Web Audio API + efectos de sonido.
// No requiere archivos de audio externos — todo se genera en tiempo real.

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicNodes = [];
        this.musicPlaying = false;
        // Por defecto muteado: el navegador requiere gesto del usuario para iniciar audio
        this.muted = localStorage.getItem('audio_muted') !== 'false';
    }

    // Inicializa el contexto (debe llamarse tras un gesto del usuario)
    init() {
        if (this.ctx) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        this.ctx = new Ctx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.muted ? 0 : 0.20;
        this.musicGain.connect(this.masterGain);

        // Reverb sutil para la música (delay simulando espacio)
        const delay = this.ctx.createDelay(2.0);
        delay.delayTime.value = 0.35;
        const feedback = this.ctx.createGain();
        feedback.gain.value = 0.35;
        const reverbWet = this.ctx.createGain();
        reverbWet.gain.value = 0.5;
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(reverbWet);
        reverbWet.connect(this.musicGain);
        this.musicReverbInput = delay;

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.muted ? 0 : 0.35;
        this.sfxGain.connect(this.masterGain);
    }

    ensureRunning() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ----- MÚSICA AMBIENTAL -----
    // Drone espacial: notas largas detunadas + filtro LP modulado
    startMusic() {
        this.ensureRunning();
        if (!this.ctx || this.musicPlaying) return;
        this.musicPlaying = true;

        // Frecuencias de un acorde menor abierto (Am9 grave)
        const baseFreqs = [55, 82.41, 110, 164.81, 220]; // A1, E2, A2, E3, A3

        baseFreqs.forEach((freq, i) => {
            // Oscilador principal
            const osc = this.ctx.createOscillator();
            osc.type = i < 2 ? 'sawtooth' : 'sine';
            osc.frequency.value = freq;

            // Segundo oscilador ligeramente desafinado para fatness
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = freq * 1.003;

            // Filtro paso-bajo que ondula lentamente
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 5;

            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 0.05 + Math.random() * 0.12;
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 400;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            // Envolvente de amplitud
            const noteGain = this.ctx.createGain();
            noteGain.gain.value = 0;
            // Fade-in suave
            noteGain.gain.linearRampToValueAtTime(0.15 / baseFreqs.length, this.ctx.currentTime + 4);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.musicGain);
            noteGain.connect(this.musicReverbInput); // a reverb también

            osc.start();
            osc2.start();
            lfo.start();

            this.musicNodes.push({ osc, osc2, lfo, gain: noteGain, filter });
        });

        // Capas armónicas: arpegio etéreo aleatorio cada ~6s
        this._arpeggioInterval = setInterval(() => this._playArpeggio(), 6000);
        setTimeout(() => this._playArpeggio(), 1000);
    }

    _playArpeggio() {
        if (!this.musicPlaying || !this.ctx) return;
        // Pentatónica en A: A, C, D, E, G
        const notes = [440, 523.25, 587.33, 659.25, 783.99, 880];
        const order = notes.slice().sort(() => Math.random() - 0.5).slice(0, 4);
        order.forEach((f, i) => {
            setTimeout(() => this._chime(f, 1.8), i * 380);
        });
    }

    _chime(freq, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const g = this.ctx.createGain();
        const t = this.ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(g);
        g.connect(this.musicGain);
        g.connect(this.musicReverbInput);
        osc.start(t);
        osc.stop(t + duration + 0.1);
    }

    stopMusic() {
        if (!this.musicPlaying) return;
        this.musicPlaying = false;
        clearInterval(this._arpeggioInterval);
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        this.musicNodes.forEach(n => {
            n.gain.gain.cancelScheduledValues(t);
            n.gain.gain.setValueAtTime(n.gain.gain.value, t);
            n.gain.gain.linearRampToValueAtTime(0, t + 1.2);
            setTimeout(() => {
                try { n.osc.stop(); n.osc2.stop(); n.lfo.stop(); } catch (_) {}
            }, 1400);
        });
        this.musicNodes = [];
    }

    // ----- TOGGLE -----
    setMuted(muted) {
        this.muted = muted;
        localStorage.setItem('audio_muted', muted ? 'true' : 'false');
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const musicTarget = muted ? 0 : 0.20;
        const sfxTarget = muted ? 0 : 0.35;
        this.musicGain.gain.cancelScheduledValues(t);
        this.musicGain.gain.linearRampToValueAtTime(musicTarget, t + 0.5);
        this.sfxGain.gain.cancelScheduledValues(t);
        this.sfxGain.gain.linearRampToValueAtTime(sfxTarget, t + 0.2);
    }

    toggle() {
        this.ensureRunning();
        const willUnmute = this.muted;
        this.setMuted(!this.muted);
        if (willUnmute && !this.musicPlaying) {
            this.startMusic();
        }
        return !this.muted;
    }

    // ----- EFECTOS DE SONIDO -----
    _envelope(node, attack, peak, decay) {
        const t = this.ctx.currentTime;
        node.gain.setValueAtTime(0, t);
        node.gain.linearRampToValueAtTime(peak, t + attack);
        node.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);
    }

    sfxClick() {
        this.ensureRunning();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.06);
        const g = this.ctx.createGain();
        this._envelope(g, 0.005, 0.18, 0.08);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    sfxWhoosh() {
        this.ensureRunning();
        if (!this.ctx) return;
        // Ruido blanco filtrado descendente
        const bufSize = this.ctx.sampleRate * 0.7;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.6);
        filter.Q.value = 2;
        const g = this.ctx.createGain();
        g.gain.value = 0.4;
        src.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain);
        src.start();
    }

    sfxWin() {
        this.ensureRunning();
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C ascendente
        notes.forEach((freq, i) => {
            setTimeout(() => this._bleep(freq, 0.2, 'triangle', 0.22), i * 110);
        });
    }

    sfxLose() {
        this.ensureRunning();
        if (!this.ctx) return;
        const notes = [440, 349.23, 261.63]; // A F C descendente
        notes.forEach((freq, i) => {
            setTimeout(() => this._bleep(freq, 0.3, 'sawtooth', 0.18), i * 140);
        });
    }

    sfxHover() {
        this.ensureRunning();
        if (!this.ctx) return;
        this._bleep(2000, 0.05, 'sine', 0.06);
    }

    _bleep(freq, duration, type = 'sine', vol = 0.2) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        const t = this.ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + duration + 0.05);
    }
}

export const audio = new AudioManager();

// Wiring del botón de mute
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;

    function syncIcon() {
        const muted = audio.muted;
        btn.classList.toggle('is-muted', muted);
        btn.setAttribute('aria-label', muted ? 'Activar audio' : 'Silenciar audio');
        btn.innerHTML = muted
            ? '<i class="fa fa-volume-off"></i>'
            : '<i class="fa fa-volume-up"></i>';
    }
    syncIcon();

    btn.addEventListener('click', () => {
        audio.toggle();
        syncIcon();
        audio.sfxClick();
    });
});
