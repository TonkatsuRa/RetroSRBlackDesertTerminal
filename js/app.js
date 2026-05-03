/* Black Desert Research Terminal app logic. Editable settings and default data are near the top. */
// ========================================
// CONFIG
// ========================================
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const lowPowerQuery = window.matchMedia("(update: slow), (pointer: coarse)");
let prefersReducedMotion = reducedMotionQuery.matches;
let MOTION_SCALE = prefersReducedMotion ? 0.25 : 1;
let mediaPreferenceHandlersBound = false;
const TYPEWRITER_CONFIG = {
    charsPerSecond: prefersReducedMotion ? 99999 : 360,
    maxCharsPerFrame: prefersReducedMotion ? 99999 : 4,
    lineDelay: prefersReducedMotion ? 0 : 0
};

function syncLowPowerMode() {
    if (!document.body) return;
    document.body.classList.toggle('low-power', prefersReducedMotion || lowPowerQuery.matches);
}

function applyMotionPreference(matches = reducedMotionQuery.matches) {
    prefersReducedMotion = Boolean(matches);
    MOTION_SCALE = prefersReducedMotion ? 0.25 : 1;
    TYPEWRITER_CONFIG.charsPerSecond = prefersReducedMotion ? 99999 : 360;
    TYPEWRITER_CONFIG.maxCharsPerFrame = prefersReducedMotion ? 99999 : 4;
    TYPEWRITER_CONFIG.lineDelay = prefersReducedMotion ? 0 : 0;
    syncLowPowerMode();

    if (prefersReducedMotion) {
        pauseRealtimePanels();
    } else {
        resumeRealtimePanels();
    }
}

function bindMediaQueryChange(query, handler) {
    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', handler);
    } else if (typeof query.addListener === 'function') {
        query.addListener(handler);
    }
}

function bindPreferenceListeners() {
    if (mediaPreferenceHandlersBound) return;
    bindMediaQueryChange(reducedMotionQuery, event => applyMotionPreference(event.matches));
    bindMediaQueryChange(lowPowerQuery, syncLowPowerMode);
    mediaPreferenceHandlersBound = true;
}

function configureLibrarySupport() {
    const root = document.documentElement;
    root.classList.toggle('has-fuse', typeof window.Fuse === 'function');
    root.classList.toggle('has-pixi', Boolean(window.PIXI && window.PIXI.Application && window.PIXI.Graphics));
    root.classList.toggle('has-howler', Boolean(window.Howler && window.Howl));
}

// ========================================
// ANIMATION
// ========================================
const Animator = {
    getGsap() {
        return window.gsap && typeof window.gsap.to === 'function' ? window.gsap : null;
    },

    canAnimate() {
        return !prefersReducedMotion && !!this.getGsap();
    },

    configure() {
        const gsap = this.getGsap();
        if (!gsap) return;
        document.documentElement.classList.add('has-gsap');
        if (typeof gsap.defaults === 'function') gsap.defaults({ overwrite: 'auto' });
        if (gsap.ticker && typeof gsap.ticker.lagSmoothing === 'function') {
            gsap.ticker.lagSmoothing(500, 33);
        }
    },

    promote(targets, property = 'transform, opacity') {
        const gsap = this.getGsap();
        if (!gsap) return;
        gsap.set(targets, { willChange: property });
    },

    release(targets) {
        const gsap = this.getGsap();
        if (!gsap) return;
        gsap.set(targets, { clearProps: 'willChange' });
    },

    bootIntro() {
        if (!this.canAnimate()) return;
        const gsap = this.getGsap();
        gsap.set('#bootScreen', { opacity: 1, scale: 1 });
        this.promote('.boot-left');
        gsap.from('.boot-left', { opacity: 0, y: 8, duration: 0.34, ease: 'power2.out', onComplete: () => this.release('.boot-left') });
    },

    bootLogo(logo) {
        if (!logo) return;
        logo.classList.add('visible');
        if (!this.canAnimate()) return;
        this.promote(logo);
        const gsap = this.getGsap();
        const tl = gsap.timeline({ onComplete: () => this.release(logo) });
        tl.fromTo(logo,
            { opacity: 0, y: 12, scaleY: 0.08 },
            { opacity: 1, y: 0, scaleY: 1, duration: 0.32, ease: 'power3.out' }
        );
        tl.to(logo, { x: -2, duration: 0.035, repeat: 3, yoyo: true, ease: 'steps(1)' }, '-=0.06');
        tl.to(logo, { x: 0, duration: 0.04, ease: 'power1.out' });
    },

    bootExit(bootScreen, onComplete) {
        if (!bootScreen) {
            if (onComplete) onComplete();
            return;
        }

        const duration = Number(bootScreen.dataset.exitDuration || 0.24);
        const terminal = document.querySelector('.screen-content');

        if (this.getGsap()) {
            this.promote([bootScreen, terminal]);
            const tl = this.getGsap().timeline({
                onComplete: () => {
                    this.release([bootScreen, terminal]);
                    if (terminal) {
                        terminal.style.opacity = '';
                        terminal.style.transform = '';
                    }
                    if (onComplete) onComplete();
                }
            });
            tl.to(bootScreen, {
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 1.006,
                duration: prefersReducedMotion ? 0.01 : duration,
                ease: 'power2.inOut'
            }, 0);
            if (terminal) {
                tl.to(terminal, {
                    opacity: 1,
                    scale: 1,
                    duration: prefersReducedMotion ? 0.01 : duration,
                    ease: 'power2.out'
                }, 0);
            }
            return;
        }

        bootScreen.classList.add('boot-fading');
        if (terminal) terminal.style.opacity = '1';
        setTimeout(() => {
            if (terminal) terminal.style.transform = '';
            if (onComplete) onComplete();
        }, prefersReducedMotion ? 0 : duration * 1000);
    },

    terminalStartup() {
        if (!this.canAnimate()) return;
        const gsap = this.getGsap();
        const tl = gsap.timeline();
        const targets = ['.screen-content', '.header-panel', '.hologram-panel', '.menu-panel', '.content-panel'];
        this.promote(targets);
        tl.from('.screen-content', { opacity: 0, scale: 0.988, duration: 0.35, ease: 'power2.out' });
        tl.from(['.header-panel', '.hologram-panel'], { opacity: 0, y: -8, duration: 0.26, stagger: 0.05, ease: 'power2.out' }, '-=0.18');
        tl.from(['.menu-panel', '.content-panel'], { opacity: 0, y: 10, duration: 0.28, stagger: 0.05, ease: 'power2.out' }, '-=0.12');
        tl.call(() => this.release(targets));
    },

    pageTransition(direction) {
        if (!this.canAnimate()) return;
        this.promote('#contentArea');
        this.getGsap().fromTo('#contentArea',
            { opacity: 0.55, x: direction < 0 ? -8 : 8 },
            { opacity: 1, x: 0, duration: 0.18, ease: 'power2.out', onComplete: () => this.release('#contentArea') }
        );
    },

    alertShake(target) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element || !this.canAnimate()) return;
        this.promote(element);
        this.getGsap().fromTo(element, { x: -3 }, { x: 0, duration: 0.22, ease: 'elastic.out(1, 0.35)', onComplete: () => this.release(element) });
    },

    dialogOpen(dialog) {
        if (!dialog || !this.canAnimate()) return;
        const box = dialog.querySelector('.dialog-box, .diagnostic-panel, .facility-panel');
        this.promote(box);
        this.getGsap().fromTo(box,
            { opacity: 0, y: 10, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'power2.out', onComplete: () => this.release(box) }
        );
    },

    dialogClose(dialog, onComplete) {
        if (!dialog) {
            if (onComplete) onComplete();
            return;
        }

        if (!this.canAnimate()) {
            if (onComplete) onComplete();
            return;
        }

        const box = dialog.querySelector('.dialog-box, .diagnostic-panel, .facility-panel');
        this.promote(box);
        this.getGsap().to(box, {
            opacity: 0,
            y: 8,
            duration: 0.14,
            ease: 'power1.in',
            onComplete: () => {
                this.release(box);
                if (onComplete) onComplete();
            }
        });
    },

    adminAccess() {
        if (!this.canAnimate()) return;
        const gsap = this.getGsap();
        const targets = ['#adminBadge', '.menu-item.admin-cmd'];
        this.promote(targets);
        gsap.fromTo('#adminBadge', { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' });
        gsap.from('.menu-item.admin-cmd', { opacity: 0.35, x: -6, duration: 0.25, stagger: 0.04, ease: 'power2.out', onComplete: () => this.release(targets) });
    }
};

// ========================================
// AUDIO
// ========================================
const AudioEngine = {
    ctx: null,
    enabled: true,
    initialized: false,
    usingHowler: false,
    masterVolume: 1,
    outputBoost: 2,
    lastToneAt: {},
    pendingStartupJingle: false,
    startupJinglePlayed: false,

    syncHowlerState() {
        if (!window.Howler) return;
        if (typeof window.Howler.volume === 'function') window.Howler.volume(this.masterVolume);
        if (typeof window.Howler.mute === 'function') window.Howler.mute(!this.enabled);
    },

    init() {
        if (this.initialized) {
            this.syncHowlerState();
            this.updateSoundStatus();
            return;
        }

        try {
            if (window.Howler) {
                window.Howler.autoUnlock = true;
                window.Howler.autoSuspend = true;
            }

            if (window.Howl && window.Howler && window.Howler.ctx) {
                this.ctx = window.Howler.ctx;
                this.usingHowler = true;
                this.syncHowlerState();
            } else {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) throw new Error('AudioContext unavailable');
                this.ctx = new AudioContextClass();
            }

            this.initialized = true;
        } catch(e) {
            this.enabled = false;
        }

        this.updateSoundStatus();
    },

    updateSoundStatus() {
        const label = getById('soundStatus');
        const dot = getById('soundDot');
        if (label) label.textContent = this.enabled ? 'ON' : 'OFF';
        if (dot) dot.classList.toggle('err', !this.enabled);
    },

    setEnabled(value) {
        this.enabled = Boolean(value);
        this.syncHowlerState();
        if (this.enabled) {
            this.init();
            this.resume();
            this.flushPendingAudio();
        }
        this.updateSoundStatus();
    },

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, Number(value) || 0));
        this.syncHowlerState();
    },

    resume() {
        if (!this.initialized) this.init();
        const ctx = this.ctx || (window.Howler && window.Howler.ctx);
        if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
            const resumeResult = ctx.resume();
            if (resumeResult && typeof resumeResult.then === 'function') {
                resumeResult
                    .then(() => this.flushPendingAudio())
                    .catch(() => {});
            }
        } else {
            this.flushPendingAudio();
        }
    },

    flushPendingAudio() {
        if (this.pendingStartupJingle && this.canPlay()) {
            this.startupJingle();
        }
    },

    cancelStartupJingle() {
        this.pendingStartupJingle = false;
    },

    destination() {
        if (window.Howler && window.Howler.masterGain) return window.Howler.masterGain;
        return this.ctx ? this.ctx.destination : null;
    },

    canPlay() {
        return this.enabled && this.ctx && this.ctx.state !== 'suspended';
    },

    isThrottled(key, minInterval) {
        if (!key || !this.ctx) return false;
        const now = this.ctx.currentTime;
        const previous = this.lastToneAt[key] || 0;
        if (now - previous < minInterval) return true;
        this.lastToneAt[key] = now;
        return false;
    },

    tone(options = {}) {
        if (!this.canPlay()) return;

        try {
            const ctx = this.ctx;
            const destination = this.destination();
            if (!destination) return;
            if (this.isThrottled(options.throttleKey, options.minInterval || 0.03)) return;

            const duration = options.duration || 0.1;
            const start = ctx.currentTime + (options.startOffset || 0);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            let filter = null;

            osc.type = options.type || 'sine';
            osc.frequency.setValueAtTime(Math.max(1, options.frequency || 180), start);
            if (options.endFrequency) {
                const endFrequency = Math.max(1, options.endFrequency);
                if (options.frequencyRamp === 'linear') {
                    osc.frequency.linearRampToValueAtTime(endFrequency, start + duration);
                } else {
                    osc.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
                }
            }

            if (options.filterFrequency) {
                filter = ctx.createBiquadFilter();
                filter.type = options.filterType || 'lowpass';
                filter.frequency.setValueAtTime(options.filterFrequency, start);
                if (options.filterEndFrequency) {
                    filter.frequency.exponentialRampToValueAtTime(Math.max(1, options.filterEndFrequency), start + duration);
                }
                osc.connect(filter);
                filter.connect(gain);
            } else {
                osc.connect(gain);
            }

            gain.connect(destination);
            const attack = options.attack || 0.006;
            const outputGain = Math.max(0.0001, Math.min(0.18, (options.gain || 0.04) * this.outputBoost));
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(outputGain, start + attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

            osc.start(start);
            osc.stop(start + duration + 0.03);
            osc.onended = () => {
                try {
                    osc.disconnect();
                    gain.disconnect();
                    if (filter) filter.disconnect();
                } catch(e) {}
            };
        } catch(e) {}
    },

    sequence(steps) {
        if (!this.canPlay()) return;
        steps.forEach(step => this.tone(step));
    },

    keyClick() {
        if (this.isThrottled('key', 0.04)) return;
        const base = 48 + Math.random() * 18;
        this.tone({ type: 'square', frequency: base, endFrequency: 32, duration: 0.028, gain: 0.052, filterFrequency: 190, attack: 0.002 });
        this.tone({ type: 'triangle', frequency: base * 0.5, duration: 0.045, gain: 0.018, filterFrequency: 95, attack: 0.002, startOffset: 0.003 });
    },

    bootBeep() {
        this.sequence([
            { type: 'triangle', frequency: 72, endFrequency: 104, frequencyRamp: 'linear', duration: 0.11, gain: 0.064, filterFrequency: 180, attack: 0.004 },
            { type: 'sine', frequency: 36, duration: 0.16, gain: 0.026, filterFrequency: 120, startOffset: 0.01 }
        ]);
    },

    errorBuzz() {
        this.sequence([
            { type: 'sawtooth', frequency: 46, endFrequency: 29, duration: 0.24, gain: 0.082, filterFrequency: 170, filterEndFrequency: 95, attack: 0.005 },
            { type: 'square', frequency: 31, duration: 0.18, gain: 0.034, filterFrequency: 110, startOffset: 0.045 }
        ]);
    },

    menuMove() {
        this.tone({ type: 'triangle', frequency: 68, duration: 0.045, gain: 0.05, filterFrequency: 150, throttleKey: 'menuMove', minInterval: 0.035, attack: 0.002 });
    },

    menuSelect() {
        this.sequence([
            { type: 'triangle', frequency: 64, endFrequency: 92, frequencyRamp: 'linear', duration: 0.075, gain: 0.07, filterFrequency: 190, attack: 0.003 },
            { type: 'sine', frequency: 38, duration: 0.13, gain: 0.03, filterFrequency: 100, startOffset: 0.025 }
        ]);
    },

    pageFlip() {
        this.sequence([
            { type: 'sawtooth', frequency: 78, endFrequency: 43, frequencyRamp: 'linear', duration: 0.11, gain: 0.066, filterFrequency: 210, attack: 0.003 },
            { type: 'triangle', frequency: 39, duration: 0.1, gain: 0.025, filterFrequency: 120, startOffset: 0.04 }
        ]);
    },

    successTone() {
        this.sequence([
            { type: 'triangle', frequency: 70, duration: 0.09, gain: 0.056, filterFrequency: 180, attack: 0.004 },
            { type: 'triangle', frequency: 96, duration: 0.11, gain: 0.052, filterFrequency: 210, startOffset: 0.095 },
            { type: 'sine', frequency: 35, duration: 0.22, gain: 0.02, filterFrequency: 90, startOffset: 0.02 }
        ]);
    },

    startupSequence() {
        this.sequence([
            { type: 'sawtooth', frequency: 24, endFrequency: 54, duration: 0.62, gain: 0.075, filterFrequency: 80, filterEndFrequency: 170, attack: 0.018 },
            { type: 'triangle', frequency: 56, duration: 0.07, gain: 0.05, filterFrequency: 150, startOffset: 0.45 },
            { type: 'triangle', frequency: 74, duration: 0.07, gain: 0.052, filterFrequency: 170, startOffset: 0.55 },
            { type: 'triangle', frequency: 56, duration: 0.07, gain: 0.046, filterFrequency: 150, startOffset: 0.65 },
            { type: 'sine', frequency: 92, duration: 0.1, gain: 0.052, filterFrequency: 190, startOffset: 0.76 }
        ]);
    },

    midiNote(frequency, startOffset, duration, gain = 0.025) {
        this.tone({
            type: 'triangle',
            frequency,
            endFrequency: frequency * 0.997,
            duration,
            gain,
            filterFrequency: 720,
            filterEndFrequency: 420,
            attack: 0.022,
            startOffset
        });
        this.tone({
            type: 'sine',
            frequency: frequency * 2,
            duration: duration * 0.72,
            gain: gain * 0.28,
            filterFrequency: 920,
            filterEndFrequency: 520,
            attack: 0.018,
            startOffset: startOffset + 0.006
        });
        this.tone({
            type: 'triangle',
            frequency: frequency * 1.006,
            duration: duration * 0.92,
            gain: gain * 0.36,
            filterFrequency: 560,
            attack: 0.026,
            startOffset: startOffset + 0.012
        });
    },

    midiChord(frequencies, startOffset, duration, gain = 0.02) {
        frequencies.forEach((frequency, index) => {
            this.midiNote(frequency, startOffset + index * 0.012, duration, gain);
        });
    },

    startupJingle() {
        if (this.startupJinglePlayed) return;
        if (!this.canPlay()) {
            this.pendingStartupJingle = true;
            this.init();
            return;
        }

        this.pendingStartupJingle = false;
        this.startupJinglePlayed = true;

        this.tone({
            type: 'sine',
            frequency: 34,
            endFrequency: 48,
            frequencyRamp: 'linear',
            duration: 1.9,
            gain: 0.026,
            filterFrequency: 100,
            filterEndFrequency: 145,
            attack: 0.08
        });
        this.midiChord([130.81, 196.0, 261.63], 0.02, 0.72, 0.018);
        this.midiChord([164.81, 246.94, 329.63], 0.34, 0.72, 0.018);
        this.midiChord([196.0, 293.66, 392.0], 0.72, 0.82, 0.017);
        this.midiChord([174.61, 261.63, 349.23], 1.08, 0.72, 0.015);
        this.midiChord([130.81, 196.0, 261.63, 392.0], 1.42, 1.35, 0.016);
        this.tone({
            type: 'triangle',
            frequency: 65.41,
            duration: 1.35,
            gain: 0.02,
            filterFrequency: 170,
            attack: 0.045,
            startOffset: 1.42
        });
    },

    accessGranted() {
        this.sequence([52, 68, 86, 108].map((frequency, index) => ({
            type: 'triangle',
            frequency,
            duration: 0.115,
            gain: 0.058,
            filterFrequency: 180,
            startOffset: index * 0.09
        })));
    },

    dataLoaded() {
        const steps = [];
        for (let i = 0; i < 6; i++) {
            steps.push({
                type: 'square',
                frequency: 52 + i * 9,
                duration: 0.04,
                gain: 0.05,
                filterFrequency: 170,
                startOffset: i * 0.045
            });
        }
        steps.push({ type: 'triangle', frequency: 92, duration: 0.11, gain: 0.06, filterFrequency: 200, startOffset: 0.29 });
        steps.push({ type: 'sine', frequency: 42, duration: 0.22, gain: 0.026, filterFrequency: 100, startOffset: 0.34 });
        this.sequence(steps);
    },

    decryptSound() {
        const steps = [];
        for (let i = 0; i < 10; i++) {
            steps.push({
                type: 'square',
                frequency: 42 + Math.random() * 68,
                duration: 0.035,
                gain: 0.04,
                filterFrequency: 160,
                startOffset: i * 0.045
            });
        }
        this.sequence(steps);
    }
};

// ========================================
// STATE
// ========================================
let database = {};
let databaseEntries = [];
let databaseLoaded = false;
let databaseSource = 'NO DATABASE';
const DATABASE_SLOT_COUNT = 3;
let databaseSlots = Array.from({ length: DATABASE_SLOT_COUNT }, (_, index) => ({
    index,
    loaded: false,
    source: '',
    file: '',
    metadata: {},
    entries: []
}));
let databaseManifest = null;
let databaseManifestSource = 'unloaded';
let activeDatabaseSelection = null;
let pendingLocalDatabaseItem = null;
let databaseDecryptFrame = null;
let terminalContent = {
    source: 'HARDCODED FALLBACK',
    loaded: false,
    values: {}
};
let adminMode = false;
const ADMIN_PASSWORD = atob("YXBvY2FseXBzZQ==");
const FALLBACK_DATABASE_MANIFEST = [
    {
        id: 'database1',
        displayName: 'Personnel Registry',
        description: 'Employee, contractor, and missing staff notes for Black Desert Research.',
        file: 'database1.md'
    },
    {
        id: 'database2',
        displayName: 'Security Incidents',
        description: 'Patrol reports, alarm events, and defense-grid irregularities.',
        file: 'database2.md'
    },
    {
        id: 'database3',
        displayName: 'Research Assets',
        description: 'Specimen vaults, prototype lockers, and archived lab inventory.',
        file: 'database3.md'
    },
    {
        id: 'database4',
        displayName: 'Outpost Relay Logs',
        description: 'Remote station, drone uplink, and mesh-network records.',
        file: 'database4.md'
    },
    {
        id: 'database5',
        displayName: 'Maintenance Queue',
        description: 'Power, life-support, access, and generator maintenance backlog.',
        file: 'database5.md'
    },
    {
        id: 'database6',
        displayName: 'Confidential Archive',
        description: 'Restricted executive notes, redacted incidents, and sealed directives.',
        file: 'database6.md'
    }
];
const queueTask = callback => {
    if (window.queueMicrotask) {
        window.queueMicrotask(callback);
    } else {
        Promise.resolve().then(callback);
    }
};

// Menu state
let selectedMenuIndex = 0;
let renderedMenuIndex = -1;
let menuItems = [];
let menuFocused = true;
let terminalKeyHandlerBound = false;
let menuHandlersBound = false;
let accessDialogReturnFocus = null;

// Pagination
let outputBuffer = [];
let outputPages = [[]];
let currentPage = 0;
let linesPerPage = 15;
let totalPages = 1;
let resizeFrame = null;
let hologramStarted = false;
let diagnosticActive = false;
let diagnosticFrame = 0;
let diagnosticAnimFrame = null;
let diagnosticLastRender = 0;
let facilityActive = false;
let facilityFrame = 0;
let facilityAnimFrame = null;
let facilityLastRender = 0;
const facilityCanvasSize = { width: 0, height: 0, ratio: 1 };
let facilityPixiState = {
    app: null,
    graphics: null,
    labelContainer: null,
    labels: [],
    canvas: null,
    unavailable: false
};
let facilityZoneCache = null;
let facilityLinkCache = null;
let facilityContactCache = null;
let databaseFuseCache = {
    signature: '',
    includeConfidential: false,
    fuse: null
};
let lastFuzzySearchUsedFuse = false;
let statusProfile = {
    source: 'INTERNAL DEFAULT',
    loaded: false,
    values: {}
};
const STATUS_PROFILE_STORAGE_KEY = 'aresStatusProfile.v1';
const domByIdCache = new Map();
let statusProfileKeyCache = null;
const statusSectionIdCache = new Map();
const statusLineGroupCache = new Map();

function getById(id) {
    const cached = domByIdCache.get(id);
    if (cached && cached.isConnected) return cached;

    const element = document.getElementById(id);
    if (element) {
        domByIdCache.set(id, element);
    } else {
        domByIdCache.delete(id);
    }
    return element;
}

function clearElement(element) {
    if (element) element.textContent = '';
}

function invalidateStatusCaches() {
    statusProfileKeyCache = null;
    statusSectionIdCache.clear();
    statusLineGroupCache.clear();
    facilityZoneCache = null;
    facilityLinkCache = null;
    facilityContactCache = null;
}

function setStatusProfile(profile) {
    statusProfile = profile;
    invalidateStatusCaches();
}

function setTerminalContent(profile) {
    terminalContent = profile && profile.loaded ? profile : {
        source: 'HARDCODED FALLBACK',
        loaded: false,
        values: {}
    };
    invalidateStatusCaches();
    applyTerminalContentToDom();
}

const DEFAULT_BOOT_SEQUENCE = [
    { type: 'line', text: '╔════════════════════════════════════════════╗', className: 't-dim' },
    { type: 'line', text: '║    ARES MACROTECHNOLOGY SYSTEMS v4.7.2     ║', className: 't-dim' },
    { type: 'line', text: '║       INITIALIZING BOOT SEQUENCE...        ║', className: 't-dim' },
    { type: 'line', text: '╚════════════════════════════════════════════╝', className: 't-dim' },
    { type: 'pause', duration: 160 },
    { type: 'blank' },
    { type: 'section', text: 'POWER AND FIRMWARE BUS' },
    { type: 'check', label: 'BIOS INIT', result: 'OK', status: 'loaded' },
    { type: 'check', label: 'MEMORY 640K BASE', result: 'OK', status: 'ok' },
    { type: 'check', label: 'EXT MEMORY 262144K', result: 'OK', status: 'ok' },
    { type: 'check', label: 'MEMORY INTEGRITY', result: 'OK', status: 'ok' },
    { type: 'check', label: 'CPU CORES', result: 'OK', status: 'operational' },
    { type: 'check', label: 'GPU ENGINE', result: 'OK', status: 'rendering' },
    { type: 'blank' },
    { type: 'section', text: 'KERNEL AND DEVICE CONTROL' },
    { type: 'check', label: 'KERNEL LOAD', result: 'OK', status: 'loaded' },
    { type: 'check', label: 'DEVICE DRIVERS', result: 'OK', status: 'loaded' },
    { type: 'check', label: 'FILESYSTEM MOUNT', result: 'OK', status: 'loaded' },
    { type: 'check', label: 'VIRTUAL MEMORY', result: 'OK', status: 'operational' },
    { type: 'blank' },
    { type: 'section', text: 'NETWORK CONNECTIONS' },
    { type: 'check', label: 'NET INTERFACE eth0', result: 'DISCONNECTED', status: 'malfunction' },
    { type: 'check', label: 'NET INTERFACE eth1', result: 'OFFLINE', status: 'unknown' },
    { type: 'check', label: 'EXTERNAL RELAY', result: 'FAILED', status: 'unknown' },
    { type: 'check', label: 'DRONE UPLINK', result: 'DEGRADED 77%', status: 'warn' },
    { type: 'check', label: 'MESH NETWORK', result: 'WEAK SIGNAL', status: 'operational' },
    { type: 'blank' },
    { type: 'section', text: 'DATABASE SYSTEMS' },
    { type: 'check', label: 'DATABASE MODULE', result: 'OK', status: 'operational' },
    { type: 'check', label: 'INDEX PARSER', result: 'OK', status: 'operational' },
    { type: 'check', label: 'INTEGRITY CHECK', result: 'OK', status: 'secure' },
    { type: 'check', label: 'QUERY ENGINE', result: 'OK', status: 'operational' },
    { type: 'blank' },
    { type: 'section', text: 'SECURITY PROTOCOLS' },
    { type: 'check', label: 'SECURITY PROTOCOL', result: 'ENGAGED', status: 'active' },
    { type: 'check', label: 'CLEARANCE LEVEL', result: 'RESTRICTED', status: 'warn' },
    { type: 'check', label: 'ENCRYPTION MODULE', result: 'ACTIVE', status: 'operational' },
    { type: 'check', label: 'CONFIDENTIAL FILES', result: 'LOCKED', status: 'warn' },
    { type: 'check', label: 'INTRUSION DETECTION', result: 'ARMED', status: 'operational' },
    { type: 'check', label: 'AUTONOMOUS DEFENSE SYSTEMS', result: 'ARMED', status: 'operational' },
    { type: 'check', label: 'DIS DETECTION SENSORS', result: 'DEGRADED', status: 'malfunction' },
    { type: 'blank' },
    { type: 'section', text: 'DISPLAY HANDOFF' },
    { type: 'check', label: 'PHOSPHOR GRID ALIGNMENT', result: 'SYNC', status: 'ok' },
    { type: 'check', label: 'TERMINAL READY', result: 'DONE', status: 'ok', final: true }
];

// Encryption
const ENCRYPTION_KEY = 'Shelby';
function xorCrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    applyMotionPreference();
    bindPreferenceListeners();
    Animator.configure();
    configureLibrarySupport();
    AudioEngine.updateSoundStatus();
    menuItems = document.querySelectorAll('.menu-item');
    calculateLinesPerPage();
    loadStoredStatusProfile();
    loadTerminalContent().finally(() => {
        startBootSequence();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('statusFileInput').addEventListener('change', handleStatusFileSelect);
    document.getElementById('accessCancelBtn').addEventListener('click', closeAccessDialog);
    document.getElementById('accessSubmitBtn').addEventListener('click', submitAccessPassword);
    document.getElementById('accessPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitAccessPassword();
        if (e.key === 'Escape') closeAccessDialog();
    });
    document.getElementById('diagnosticClose').addEventListener('click', closeDiagnosticDashboard);
    document.getElementById('diagnosticOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'diagnosticOverlay') closeDiagnosticDashboard();
    });
    document.getElementById('facilityClose').addEventListener('click', closeFacilityStatus);
    document.getElementById('facilityOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'facilityOverlay') closeFacilityStatus();
    });
    
    window.addEventListener('resize', () => {
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            calculateLinesPerPage();
            recalculatePages();
            if (!hologramStarted && document.body.classList.contains('terminal-ready')) {
                initHologram();
            }
            if (facilityActive) {
                renderFacilityStatus(performance.now());
            }
        });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    document.addEventListener('wheel', e => {
        if (e.cancelable && !e.target.closest('.boot-left, .menu-list, .dialog-box, .diagnostic-panel, .facility-panel')) e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', e => {
        if (e.cancelable && !e.target.closest('.boot-left, .menu-list, .dialog-box, .diagnostic-panel, .facility-panel, #gameOverlay, #casinoOverlay, #liebiOverlay')) e.preventDefault();
    }, { passive: false });
    document.addEventListener('pointerdown', () => AudioEngine.resume(), { once: true });
    document.addEventListener('keydown', () => AudioEngine.resume(), { once: true });
});

function calculateLinesPerPage() {
    const viewport = getById('contentViewport');
    if (viewport) {
        const content = getById('contentArea');
        if (!content) return;
        const fontSize = parseFloat(getComputedStyle(content).fontSize);
        const lineHeight = fontSize * 1.22;
        const padding = 20; // top + bottom padding
        const availableHeight = viewport.clientHeight - padding;
        linesPerPage = Math.floor(availableHeight / lineHeight);
        linesPerPage = Math.max(10, linesPerPage);
    }
}

// ========================================
// BOOT SEQUENCE
// ========================================
function startBootSequence() {
    const bootOutput = document.getElementById('bootOutput');
    const bootLogo = document.getElementById('bootLogo');
    const bootScreen = document.getElementById('bootScreen');
    const bootSkip = document.getElementById('bootSkip');
    const bootScroll = bootOutput.closest('.boot-left');
    const bootTimers = [];
    const bootSpeed = prefersReducedMotion ? MOTION_SCALE : 0.72;
    let bootComplete = false;
    let stepIndex = 0;
    let bootScrollFrame = null;
    let bootScrollTarget = 0;
    let terminalStarted = false;

    function schedule(callback, delay = 0) {
        const scaledDelay = Math.max(prefersReducedMotion ? 0 : 10, Math.round(delay * bootSpeed));
        const timerId = setTimeout(() => {
            const index = bootTimers.indexOf(timerId);
            if (index > -1) bootTimers.splice(index, 1);
            if (!bootComplete) callback();
        }, scaledDelay);
        bootTimers.push(timerId);
        return timerId;
    }

    function cleanupBootListeners() {
        bootTimers.forEach(timerId => clearTimeout(timerId));
        bootTimers.length = 0;
        if (bootScrollFrame) {
            cancelAnimationFrame(bootScrollFrame);
            bootScrollFrame = null;
        }
        if (bootSkip) {
            bootSkip.removeEventListener('pointerdown', handleBootSkip);
            bootSkip.removeEventListener('click', handleBootSkip);
        }
        document.removeEventListener('keydown', handleBootKeydown);
    }

    function finishBoot(skipped = false, options = {}) {
        if (bootComplete) return;
        bootComplete = true;
        cleanupBootListeners();
        let shouldInitTerminal = false;

        if (skipped && bootOutput) {
            const skipLine = document.createElement('div');
            skipLine.className = 'glow t-amber';
            skipLine.textContent = '[BOOT SEQUENCE SKIPPED BY OPERATOR]';
            bootOutput.appendChild(skipLine);
            scrollBoot(true);
        }

        AudioEngine.successTone();
        bootScreen.dataset.exitDuration = String(options.exitDuration || (skipped ? 0.24 : 1));
        if (!terminalStarted) {
            terminalStarted = true;
            const terminal = document.querySelector('.screen-content');
            if (terminal) {
                terminal.style.opacity = '0';
                terminal.style.transform = 'scale(0.995)';
            }
            document.body.classList.add('terminal-ready');
            shouldInitTerminal = true;
        }
        Animator.bootExit(bootScreen, () => {
            bootScreen.classList.add('hidden');
            if (shouldInitTerminal) initTerminal();
        });
    }

    function handleBootSkip(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        AudioEngine.cancelStartupJingle();
        AudioEngine.resume();
        finishBoot(true);
    }

    function handleBootKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            handleBootSkip(e);
        }
    }
    
    // Right side ASCII art (shows after initial diagnostics)
    const fallbackRightSideLogo = `
<span style="color:#ffb000">     █████╗ ██████╗ ███████╗███████╗</span>
<span style="color:#ffb000">    ██╔══██╗██╔══██╗██╔════╝██╔════╝</span>
<span style="color:#ffb000">    ███████║██████╔╝█████╗  ███████╗</span>
<span style="color:#ffb000">    ██╔══██║██╔══██╗██╔══╝  ╚════██║</span>
<span style="color:#ffb000">    ██║  ██║██║  ██║███████╗███████║</span>
<span style="color:#ffb000">    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝</span>
<span style="color:#888">     M A C R O T E C H N O L O G Y</span>

<span style="color:#20c20e">════════════════════════════════════</span>

<span style="color:#00d4aa">  ██████╗ ██╗      █████╗  ██████╗██╗  ██╗</span>
<span style="color:#00d4aa">  ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝</span>
<span style="color:#00d4aa">  ██████╔╝██║     ███████║██║     █████╔╝</span>
<span style="color:#00d4aa">  ██╔══██╗██║     ██╔══██║██║     ██╔═██╗</span>
<span style="color:#00d4aa">  ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗</span>
<span style="color:#00d4aa">  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝</span>

<span style="color:#00d4aa">  ██████╗ ███████╗███████╗███████╗██████╗ ████████╗</span>
<span style="color:#00d4aa">  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗╚══██╔══╝</span>
<span style="color:#00d4aa">  ██║  ██║█████╗  ███████╗█████╗  ██████╔╝   ██║</span>
<span style="color:#00d4aa">  ██║  ██║██╔══╝  ╚════██║██╔══╝  ██╔══██╗   ██║</span>
<span style="color:#00d4aa">  ██████╔╝███████╗███████║███████╗██║  ██║   ██║</span>
<span style="color:#00d4aa">  ╚═════╝ ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝</span>

<span style="color:#39ff14;text-shadow:0 0 10px #20c20e">    R E S E A R C H   T E R M I N A L</span>

<span style="color:#20c20e">════════════════════════════════════</span>

<span style="color:#ff3333">  ╔═══════════════════════════════════════╗</span>
<span style="color:#ff3333">  ║  W A R N I N G :  AUTHORIZED ONLY    ║</span>
<span style="color:#ff3333">  ║  All activity monitored and logged.  ║</span>
<span style="color:#ff3333">  ╚═══════════════════════════════════════╝</span>
`;
    const rightSideLogo = getBootLogoMarkup(fallbackRightSideLogo);
    
    const bootSequence = getBootSequence();

    function sleep(delay = 0, scaled = true) {
        if (scaled) return new Promise(resolve => schedule(resolve, delay));
        return new Promise(resolve => {
            const timerId = setTimeout(() => {
                const index = bootTimers.indexOf(timerId);
                if (index > -1) bootTimers.splice(index, 1);
                if (!bootComplete) resolve();
            }, prefersReducedMotion ? Math.min(delay, 250) : delay);
            bootTimers.push(timerId);
        });
    }

    function scrollBoot(instant = false) {
        if (!bootScroll) return;
        bootScrollTarget = Math.max(0, bootScroll.scrollHeight - bootScroll.clientHeight);
        if (instant || prefersReducedMotion) {
            bootScroll.scrollTop = bootScrollTarget;
            return;
        }
        if (bootScrollFrame) return;
        bootScrollFrame = requestAnimationFrame(function glide() {
            bootScrollFrame = null;
            const delta = bootScrollTarget - bootScroll.scrollTop;
            if (Math.abs(delta) < 1) {
                bootScroll.scrollTop = bootScrollTarget;
                return;
            }
            bootScroll.scrollTop += delta * 0.32;
            bootScrollFrame = requestAnimationFrame(glide);
        });
    }

    function addBootLine(className = '') {
        const div = document.createElement('div');
        div.className = `boot-line glow ${className}`.trim();
        bootOutput.appendChild(div);
        scrollBoot();
        return div;
    }

function bootStatusClass(status) {
        if (['alert', 'critical', 'danger', 'red', 'fail', 'failed', 'malfunction', 'disconnected', 'offline'].includes(status)) return 't-red';
        if (['warn', 'warning', 'unknown', 'degraded', 'maintenance', 'service', 'partial', 'low', 'weak', 'intermittent'].includes(status)) return 't-amber';
        return 't-cyan';
    }

    function bootStatusSeverity(status) {
        if (['alert', 'critical', 'danger', 'red', 'fail', 'failed', 'malfunction', 'disconnected', 'offline'].includes(status)) return 'fail';
        if (['warn', 'warning', 'unknown', 'degraded', 'maintenance', 'service', 'partial', 'low', 'weak', 'intermittent'].includes(status)) return 'warn';
        return 'ok';
    }

    function displayBootResult(result) {
        if (window.innerWidth > 700) return result;
        const compact = {
            'DEGRADED 47%': 'DEG 47%',
            'DEGRADED 77%': 'DEG 77%',
            'DISCONNECTED': 'DISC',
            'WEAK SIGNAL': 'WEAK',
            'RESTRICTED': 'RESTRICT'
        };
        return compact[result] || result;
    }

    function formatCheckLabel(label) {
        const compactLabels = {
            'MEMORY 640K BASE': 'MEM 640K BASE',
            'EXT MEMORY 262144K': 'EXT MEM 262144K',
            'NET INTERFACE ETH0': 'NET eth0',
            'NET INTERFACE ETH1': 'NET eth1',
            'SATELLITE UPLINK': 'SAT UPLINK',
            'EXTERNAL RELAY': 'EXT RELAY',
            'DRONE UPLINK': 'DRONE LINK',
            'DATABASE MODULE': 'DB MODULE',
            'INTEGRITY CHECK': 'INTEGRITY',
            'SECURITY PROTOCOL': 'SECURITY',
            'CLEARANCE LEVEL': 'CLEARANCE',
            'ENCRYPTION MODULE': 'ENCRYPTION',
            'CONFIDENTIAL FILES': 'CONF FILES',
            'INTRUSION DETECTION': 'INTRUSION',
            'AUTONOMOUS DEFENSE SYSTEMS': 'AUTO DEFENSE',
            'DIS DETECTION SENSORS': 'DIS SENSORS',
            'PHOSPHOR GRID ALIGNMENT': 'PHOSPHOR GRID'
        };
        const source = label.toUpperCase();
        const clean = window.innerWidth < 520 ? (compactLabels[source] || source) : source;
        const width = window.innerWidth < 520 ? 18 : 30;
        const dotCount = Math.max(4, width - clean.length);
        return `${clean} ${'.'.repeat(dotCount)}`;
    }

    function typeBootText(element, text, options = {}) {
        element.textContent = '';
        if (prefersReducedMotion || !text) {
            element.textContent = text;
            return Promise.resolve();
        }

        const charsPerSecond = options.charsPerSecond || 180;
        let index = 0;
        let lastTime = 0;
        let budget = 0;
        element.classList.add('boot-caret');

        return new Promise(resolve => {
            function tick(timestamp = 0) {
                if (bootComplete) {
                    element.classList.remove('boot-caret');
                    resolve();
                    return;
                }

                if (!lastTime) lastTime = timestamp;
                const elapsed = Math.min(34, Math.max(0, timestamp - lastTime));
                lastTime = timestamp;
                budget += (elapsed / 1000) * charsPerSecond;

                if (budget >= 1) {
                    const charsThisFrame = Math.max(1, Math.min(3, Math.floor(budget)));
                    const nextIndex = Math.min(text.length, index + charsThisFrame);
                    element.textContent += text.substring(index, nextIndex);
                    index = nextIndex;
                    budget = Math.max(0, budget - charsThisFrame);
                    if (index % 12 === 0) AudioEngine.keyClick();
                    scrollBoot();
                }

                if (index < text.length) {
                    requestAnimationFrame(tick);
                } else {
                    element.classList.remove('boot-caret');
                    resolve();
                }
            }

            requestAnimationFrame(tick);
        });
    }

    async function renderBootLine(text, className = '') {
        const line = addBootLine(className);
        const label = document.createElement('span');
        label.className = 'boot-label';
        line.appendChild(label);
        await typeBootText(label, text, { charsPerSecond: 220 });
    }

    async function renderBootCheck(step) {
        const line = addBootLine('boot-check');
        const label = document.createElement('span');
        const status = document.createElement('span');
        label.className = 'boot-label';
        status.className = 'boot-status t-dim';
        line.appendChild(label);
        line.appendChild(status);

        await typeBootText(label, formatCheckLabel(step.label));
        if (bootComplete) return;

        status.textContent = '[CHECK]';
        status.classList.add('visible');
        AudioEngine.keyClick();
        const severity = bootStatusSeverity(step.status);
        await sleep(severity === 'fail' ? 150 : 70);
        if (bootComplete) return;

        status.className = `boot-status visible ${bootStatusClass(step.status)}`;
        status.textContent = `[${displayBootResult(step.result)}]`;
        if (severity === 'fail') {
            AudioEngine.errorBuzz();
        } else if (severity === 'warn') {
            AudioEngine.menuMove();
        } else {
            AudioEngine.bootBeep();
        }
        await sleep(step.final ? 240 : 50);
    }

    async function renderBootLoadingBar(duration = 10000) {
        const line = addBootLine('boot-loader');
        const label = document.createElement('span');
        label.className = 'boot-label';
        line.appendChild(label);

        const spinner = ['|', '/', '-', '\\'];
        const barWidth = window.innerWidth < 520 ? 18 : 32;
        const start = performance.now();
        let lastBeep = 0;

        return new Promise(resolve => {
            function tick(now = performance.now()) {
                if (bootComplete) {
                    resolve();
                    return;
                }

                const elapsed = Math.min(duration, now - start);
                const progress = elapsed / duration;
                const filled = Math.min(barWidth, Math.floor(progress * barWidth));
                const bar = '#'.repeat(filled) + '-'.repeat(barWidth - filled);
                const percent = String(Math.floor(progress * 100)).padStart(3, '0');
                label.textContent = `${spinner[Math.floor(elapsed / 120) % spinner.length]} FINAL BUFFER LOAD [${bar}] ${percent}%`;
                scrollBoot();

                if (now - lastBeep > 620) {
                    lastBeep = now;
                    AudioEngine.keyClick();
                }

                if (elapsed >= duration) {
                    label.textContent = `> FINAL BUFFER LOAD [${'#'.repeat(barWidth)}] 100% COMPLETE`;
                    AudioEngine.successTone();
                    resolve();
                } else {
                    requestAnimationFrame(tick);
                }
            }

            requestAnimationFrame(tick);
        });
    }

    async function clearBootLog() {
        if (window.gsap && !prefersReducedMotion) {
            await new Promise(resolve => {
                gsap.to(bootOutput, {
                    opacity: 0,
                    y: -10,
                    duration: 0.34,
                    ease: 'power2.in',
                    onComplete: resolve
                });
            });
        } else {
            bootOutput.classList.add('fading');
            await sleep(340, false);
        }

        clearElement(bootOutput);
        bootOutput.classList.remove('fading');
        bootOutput.style.opacity = '';
        bootOutput.style.transform = '';
        if (bootScroll) bootScroll.scrollTop = 0;
    }

    async function showBootLogo() {
        bootScreen.classList.remove('boot-log-mode');
        const logo = document.createElement('div');
        logo.className = 'boot-logo boot-logo-inline glow';
        logo.innerHTML = rightSideLogo;
        bootOutput.appendChild(logo);
        if (bootScroll) bootScroll.scrollTop = 0;
        Animator.bootLogo(logo);
    }

    async function enterBootBlackout() {
        if (window.gsap && !prefersReducedMotion) {
            await new Promise(resolve => {
                gsap.to([bootOutput, '.boot-skip'], {
                    opacity: 0,
                    duration: 0.34,
                    ease: 'power2.in',
                    onComplete: resolve
                });
            });
        }
        bootScreen.classList.add('boot-blackout');
        await sleep(420, false);
    }
    
    // Set logo content (hidden initially)
    bootScreen.classList.remove('hidden', 'boot-fading', 'boot-blackout');
    bootScreen.classList.add('boot-log-mode');
    bootScreen.dataset.exitDuration = '0.24';
    clearElement(bootOutput);
    bootOutput.classList.remove('fading');
    bootOutput.style.opacity = '';
    bootOutput.style.transform = '';
    clearElement(bootLogo);
    bootLogo.classList.remove('visible');
    const bootLeft = document.querySelector('.boot-left');
    if (bootLeft) {
        bootLeft.style.opacity = '';
        bootLeft.style.transform = '';
    }

    if (bootSkip) {
        bootSkip.addEventListener('pointerdown', handleBootSkip);
        bootSkip.addEventListener('click', handleBootSkip);
    }
    document.addEventListener('keydown', handleBootKeydown);

    AudioEngine.startupSequence();
    Animator.bootIntro();

    async function runBootSequence() {
        await sleep(280);

        while (!bootComplete && stepIndex < bootSequence.length) {
            const step = bootSequence[stepIndex++];

            if (step.type === 'pause') {
                await sleep(step.duration);
            } else if (step.type === 'blank') {
                addBootLine();
                await sleep(35);
            } else if (step.type === 'section') {
                await renderBootLine(`> ${step.text}`, 'boot-section');
                await sleep(55);
            } else if (step.type === 'check') {
                await renderBootCheck(step);
            } else {
                await renderBootLine(step.text, step.className || '');
                await sleep(28);
            }
        }

        if (bootComplete) return;

        await sleep(140);
        await renderBootLine('> DISPLAY BUFFER LOCKED // CORPORATE IDENT READY', 'boot-section');
        await renderBootLoadingBar(prefersReducedMotion ? 800 : 10000);
        if (bootComplete) return;

        await sleep(260, false);
        await clearBootLog();
        if (bootComplete) return;

        await showBootLogo();
        if (bootComplete) return;
        AudioEngine.startupJingle();
        await sleep(prefersReducedMotion ? 900 : 5000, false);
        if (bootComplete) return;

        await enterBootBlackout();
        finishBoot(false, { exitDuration: prefersReducedMotion ? 0.01 : 1 });
    }

    runBootSequence();
}

// ========================================
// TERMINAL INIT
// ========================================
function initTerminal() {
    showWelcome();
    updateMenuSelection();
    updateDatabaseSlotIndicators();
    const startHologram = () => initHologram();
    if (window.requestIdleCallback && !prefersReducedMotion) {
        window.requestIdleCallback(startHologram, { timeout: 900 });
    } else {
        setTimeout(startHologram, prefersReducedMotion ? 0 : 450);
    }
    
    if (!terminalKeyHandlerBound) {
        document.addEventListener('keydown', handleGlobalKeydown);
        terminalKeyHandlerBound = true;
    }
    
    // Click on menu items
    if (!menuHandlersBound) {
        menuItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                selectedMenuIndex = index;
                updateMenuSelection();
                executeSelectedCommand();
            });
        });
        document.querySelectorAll('.database-slot-button[data-slot]').forEach(button => {
            button.addEventListener('click', () => {
                const slotIndex = Number.parseInt(button.dataset.slot || '0', 10);
                showDatabaseSlotDialog(slotIndex);
            });
        });
        menuHandlersBound = true;
    }
}

function handleGlobalKeydown(e) {
    if (document.getElementById('liebiOverlay') || document.getElementById('gameOverlay') || document.getElementById('casinoOverlay')) {
        return;
    }

    const facilityOverlay = document.getElementById('facilityOverlay');
    if (facilityOverlay.classList.contains('active')) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeFacilityStatus();
        }
        return;
    }

    const diagnosticOverlay = document.getElementById('diagnosticOverlay');
    if (diagnosticOverlay.classList.contains('active')) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeDiagnosticDashboard();
        }
        return;
    }

    const databaseModal = document.getElementById('databaseModal');
    if (databaseModal) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeDatabaseModal();
            return;
        }
        if (e.key === 'Enter') {
            const authButton = databaseModal.querySelector('[data-authenticate-database="true"]');
            if (authButton && !authButton.disabled) {
                e.preventDefault();
                authButton.click();
            }
            return;
        }
        return;
    }

    // Check if dialog is open
    if (document.getElementById('accessDialog').classList.contains('active')) {
        return;
    }
    
    const input = document.getElementById('commandInput');
    
    // If typing in input
    if (document.activeElement === input) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = input.value.trim();
            if (value) {
                processCommand(value);
                input.value = '';
            }
            menuFocused = true;
            input.blur();
        } else if (e.key === 'Escape') {
            menuFocused = true;
            input.blur();
            input.value = '';
        }
        return;
    }

    const activeMenuItem = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('.menu-item')
        : null;
    if (activeMenuItem && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const focusedIndex = Number(activeMenuItem.dataset.index);
        if (Number.isFinite(focusedIndex)) selectedMenuIndex = focusedIndex;
        updateMenuSelection();
        executeSelectedCommand();
        return;
    }
    
    // Menu navigation
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateMenu(-1);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateMenu(1);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelectedCommand();
    } else if (e.key === 'ArrowLeft' && totalPages > 1) {
        e.preventDefault();
        prevPage();
    } else if (e.key === 'ArrowRight' && totalPages > 1) {
        e.preventDefault();
        nextPage();
    }
}

function navigateMenu(direction) {
    AudioEngine.menuMove();
    selectedMenuIndex += direction;
    
    // Wrap around
    if (selectedMenuIndex < 0) selectedMenuIndex = menuItems.length - 1;
    if (selectedMenuIndex >= menuItems.length) selectedMenuIndex = 0;
    
    // Skip locked admin items if not admin
    const item = menuItems[selectedMenuIndex];
    if (!adminMode && item.classList.contains('admin-cmd') && item.classList.contains('locked')) {
        navigateMenu(direction);
        return;
    }
    
    updateMenuSelection();
}

function updateMenuSelection() {
    if (renderedMenuIndex === selectedMenuIndex) return;

    if (renderedMenuIndex < 0) {
        menuItems.forEach((item, index) => {
            const selected = index === selectedMenuIndex;
            item.classList.toggle('selected', selected);
            item.setAttribute('aria-current', selected ? 'true' : 'false');
        });
    } else {
        const previous = menuItems[renderedMenuIndex];
        const next = menuItems[selectedMenuIndex];
        if (previous) {
            previous.classList.remove('selected');
            previous.setAttribute('aria-current', 'false');
        }
        if (next) {
            next.classList.add('selected');
            next.setAttribute('aria-current', 'true');
        }
    }

    renderedMenuIndex = selectedMenuIndex;
}

function executeSelectedCommand() {
    const item = menuItems[selectedMenuIndex];
    const cmd = item.dataset.cmd;
    
    // Check if locked
    if (item.classList.contains('locked')) {
        AudioEngine.errorBuzz();
        Animator.alertShake(item);
        return;
    }
    
    AudioEngine.menuSelect();
    
    switch(cmd) {
        case 'welcome':
            showWelcome();
            break;
        case 'help':
            showHelp();
            break;
        case 'load':
            showDatabaseSelector();
            break;
        case 'loadStatus':
            document.getElementById('statusFileInput').click();
            break;
        case 'search':
            focusInputWithPrefix('SEARCH ');
            break;
        case 'categories':
            showCategories();
            break;
        case 'diagnostic':
            showDiagnosticDashboard();
            break;
        case 'facility':
            showFacilityStatus();
            break;
        case 'clear':
            clearOutput();
            break;
        case 'access':
            showAccessDialog();
            break;
        case 'list':
            if (adminMode) listAllEntries();
            break;
        case 'fsearch':
            if (adminMode) focusInputWithPrefix('FSEARCH ');
            break;
        case 'logout':
            if (adminMode) logout();
            break;
    }
}

function focusInputWithPrefix(prefix) {
    const input = document.getElementById('commandInput');
    input.value = prefix;
    input.focus();
    menuFocused = false;
}

// ========================================
// OUTPUT & PAGINATION WITH TYPEWRITER
// ========================================
let typewriterQueue = [];
let isTyping = false;
let skipTypewriter = false;
let typewriterRunId = 0;
let outputRenderFrame = null;
let typewriterFrame = null;
let bufferRecalcPending = false;
let outputGroupCounter = 0;

function addToBuffer(text, className = '') {
    const lines = text.split('\n');
    lines.forEach(line => {
        outputBuffer.push({ text: line, className });
    });
    scheduleBufferRecalculate();
}

function isOutputPageBreak(text) {
    return ['@pagebreak', '[pagebreak]', '{pagebreak}'].includes(String(text || '').trim().toLowerCase());
}

function addPageBreakToBuffer() {
    outputBuffer.push({ text: '', className: '', pageBreak: true });
    scheduleBufferRecalculate();
}

function addOutputGroup(lines) {
    const group = lines.filter(line => line && typeof line.text === 'string');
    if (!group.length) return;
    const groupId = `help-${++outputGroupCounter}`;
    group.forEach(line => {
        outputBuffer.push({ text: line.text, className: line.className || '', groupId });
    });
    scheduleBufferRecalculate();
}

function isHelpHeadingLine(text, className = '') {
    if (!String(text || '').trim()) return false;
    const classes = String(className || '').split(/\s+/);
    return classes.includes('t-cyan') || classes.includes('t-red');
}

function renderHelpLinesGrouped(lines) {
    let group = [];

    function flushGroup() {
        if (!group.length) return;
        addOutputGroup(group);
        group = [];
    }

    lines.forEach(line => {
        if (isOutputPageBreak(line.text)) {
            flushGroup();
            addPageBreakToBuffer();
            return;
        }
        if (isHelpHeadingLine(line.text, line.className) && group.length) {
            flushGroup();
        }
        group.push(line);
    });
    flushGroup();
}

function scheduleBufferRecalculate() {
    if (bufferRecalcPending) return;
    bufferRecalcPending = true;
    queueTask(() => {
        bufferRecalcPending = false;
        recalculatePages();
    });
}

function appendLineToPages(pages, line) {
    let current = pages[pages.length - 1];
    if (current.length >= linesPerPage) {
        current = [];
        pages.push(current);
    }
    current.push({ text: line.text, className: line.className || '' });
}

function appendGroupToPages(pages, group) {
    if (!group.length) return;
    let current = pages[pages.length - 1];
    const heading = isHelpHeadingLine(group[0].text, group[0].className) ? group[0] : null;

    if (group.length <= linesPerPage) {
        if (current.length && current.length + group.length > linesPerPage) {
            current = [];
            pages.push(current);
        }
        group.forEach(line => current.push({ text: line.text, className: line.className || '' }));
        return;
    }

    if (!heading) {
        group.forEach(line => appendLineToPages(pages, line));
        return;
    }

    if (current.length && linesPerPage - current.length < 2) {
        current = [];
        pages.push(current);
    }

    current.push({ text: heading.text, className: heading.className || '' });
    const body = group.slice(1);
    while (body.length) {
        current = pages[pages.length - 1];
        if (current.length >= linesPerPage) {
            current = [{ text: heading.text, className: heading.className || '' }];
            pages.push(current);
        }
        const bodyLine = body.shift();
        current.push({ text: bodyLine.text, className: bodyLine.className || '' });
    }
}

function buildOutputPages() {
    const pages = [[]];
    for (let i = 0; i < outputBuffer.length; i++) {
        const line = outputBuffer[i];
        if (line.pageBreak) {
            if (pages[pages.length - 1].length) pages.push([]);
            continue;
        }
        if (line.groupId) {
            const groupId = line.groupId;
            const group = [];
            while (i < outputBuffer.length && outputBuffer[i].groupId === groupId) {
                group.push(outputBuffer[i]);
                i++;
            }
            i--;
            appendGroupToPages(pages, group);
            continue;
        }
        appendLineToPages(pages, line);
    }
    while (pages.length > 1 && pages[pages.length - 1].length === 0) pages.pop();
    return pages;
}

function recalculatePages() {
    outputPages = buildOutputPages();
    totalPages = Math.max(1, outputPages.length);
    currentPage = 0;
    updatePageIndicator();
    scheduleCurrentPageRender();
}

function scheduleCurrentPageRender() {
    if (outputRenderFrame) return;
    outputRenderFrame = requestAnimationFrame(() => {
        outputRenderFrame = null;
        renderCurrentPage();
    });
}

function clearOutput() {
    if (outputRenderFrame) {
        cancelAnimationFrame(outputRenderFrame);
        outputRenderFrame = null;
    }
    if (typewriterFrame) {
        cancelAnimationFrame(typewriterFrame);
        typewriterFrame = null;
    }
    outputBuffer = [];
    outputPages = [[]];
    currentPage = 0;
    totalPages = 1;
    bufferRecalcPending = false;
    outputGroupCounter = 0;
    typewriterQueue = [];
    isTyping = false;
    typewriterRunId++;
    updatePageIndicator();
    clearElement(getById('output'));
}

function updatePageIndicator() {
    const indicator = getById('pageIndicator');
    const hint = getById('navHint');
    if (!indicator || !hint) return;
    if (totalPages > 1) {
        indicator.textContent = `PAGE ${currentPage + 1}/${totalPages}`;
        hint.classList.add('visible');
    } else {
        indicator.textContent = '';
        hint.classList.remove('visible');
    }
}

function renderCurrentPage() {
    if (typewriterFrame) {
        cancelAnimationFrame(typewriterFrame);
        typewriterFrame = null;
    }
    const output = getById('output');
    clearElement(output);
    if (!output) return;
    
    const pageLines = outputPages[currentPage] || [];
    
    // Queue lines for typewriter effect
    typewriterRunId++;
    const runId = typewriterRunId;
    typewriterQueue = [];
    isTyping = false;
    skipTypewriter = false;
    
    pageLines.forEach((line, index) => {
        typewriterQueue.push({ text: line.text, className: line.className });
    });
    
    processTypewriterQueue(runId);
    updatePageIndicator();
}

function processTypewriterQueue(runId = typewriterRunId) {
    if (runId !== typewriterRunId) return;
    if (typewriterQueue.length === 0) {
        isTyping = false;
        typewriterFrame = null;
        return;
    }
    
    isTyping = true;
    const line = typewriterQueue.shift();
    const output = getById('output');
    if (!output) return;
    const div = document.createElement('div');
    div.className = `output-line ${line.className}`.trim();
    output.appendChild(div);
    
    const queueNextLine = (delay = TYPEWRITER_CONFIG.lineDelay) => {
        let startTime = 0;
        const waitForNextFrame = (timestamp = 0) => {
            if (runId !== typewriterRunId) return;
            if (!startTime) startTime = timestamp;
            if (timestamp - startTime >= delay) {
                typewriterFrame = null;
                processTypewriterQueue(runId);
            } else {
                typewriterFrame = requestAnimationFrame(waitForNextFrame);
            }
        };
        typewriterFrame = requestAnimationFrame(waitForNextFrame);
    };

    if (skipTypewriter || line.text.length === 0) {
        div.textContent = line.text;
        queueNextLine();
        return;
    }
    
    // Typewriter effect - fast but visible
    let charIndex = 0;
    const text = line.text;
    let lastTypeTime = 0;
    let charBudget = 0;
    
    function typeChar(timestamp = 0) {
        if (runId !== typewriterRunId) return;
        if (skipTypewriter) {
            div.textContent = text;
            queueNextLine();
            return;
        }
        
        if (charIndex < text.length) {
            if (!lastTypeTime) lastTypeTime = timestamp;
            const elapsed = Math.min(34, Math.max(0, timestamp - lastTypeTime));
            lastTypeTime = timestamp;
            charBudget += (elapsed / 1000) * TYPEWRITER_CONFIG.charsPerSecond;
            const previousCharIndex = charIndex;

            const charsThisFrame = prefersReducedMotion
                ? text.length - charIndex
                : Math.max(1, Math.min(
                    TYPEWRITER_CONFIG.maxCharsPerFrame,
                    text.length - charIndex,
                    Math.floor(charBudget)
                ));

            if (charBudget >= 1 || prefersReducedMotion) {
                const nextIndex = charIndex + charsThisFrame;
                charIndex = nextIndex;
                div.textContent = text.slice(0, charIndex);
                charBudget = Math.max(0, charBudget - charsThisFrame);
            }
            
            // Occasional click sound
            if (charIndex !== previousCharIndex && charIndex % 12 === 0) {
                AudioEngine.keyClick();
            }
            
            typewriterFrame = requestAnimationFrame(typeChar);
        } else {
            queueNextLine();
        }
    }
    
    typewriterFrame = requestAnimationFrame(typeChar);
}

function print(text, className = '') {
    addToBuffer(text, className);
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        skipTypewriter = true;
        AudioEngine.pageFlip();
        renderCurrentPageInstant();
        Animator.pageTransition(-1);
    }
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        skipTypewriter = true;
        AudioEngine.pageFlip();
        renderCurrentPageInstant();
        Animator.pageTransition(1);
    }
}

// Instant render for page navigation (no typewriter)
function renderCurrentPageInstant() {
    if (outputRenderFrame) {
        cancelAnimationFrame(outputRenderFrame);
        outputRenderFrame = null;
    }
    typewriterRunId++;
    typewriterQueue = [];
    isTyping = false;
    if (typewriterFrame) {
        cancelAnimationFrame(typewriterFrame);
        typewriterFrame = null;
    }
    const output = getById('output');
    clearElement(output);
    if (!output) return;
    
    const pageLines = outputPages[currentPage] || [];
    const fragment = document.createDocumentFragment();
    
    pageLines.forEach(line => {
        const div = document.createElement('div');
        div.textContent = line.text;
        div.className = `output-line ${line.className}`.trim();
        fragment.appendChild(div);
    });

    output.appendChild(fragment);
    
    updatePageIndicator();
}

// ========================================
// COMMANDS
// ========================================
function printAdminRequired(action) {
    AudioEngine.errorBuzz();
    clearOutput();
    print('');
    print(`${action}: ADMIN ACCESS REQUIRED`, 't-red');
    print(contentGet('admin.required_hint', 'Use ACCESS to authenticate before modifying status systems.'), 't-dim');
    print('');
}

function printNoDatabaseLoaded() {
    AudioEngine.errorBuzz();
    clearOutput();
    print('');
    print(contentGet('errors.no_database', 'ERROR: No database loaded.'), 't-red');
    print(contentGet('errors.no_database_hint', 'Use LOAD DATABASE to select a package first.'), 't-dim');
    print('');
}

function printDatabaseSlotsFull() {
    AudioEngine.errorBuzz();
    clearOutput();
    print('');
    print('DATABASE SLOT CAPACITY REACHED', 't-red');
    print('Three database packages are already mounted.', 't-dim');
    print('Eject a slot before loading another package.', 't-amber');
    print('Commands: EJECT DATABASE SLOT 1 / 2 / 3 or EJECT ALL DATABASE', 't-dim');
    print('');
}

function handleEjectCommand(args) {
    const request = normalizeStatusKey(args).replace(/_/g, ' ');
    if (!request) {
        clearOutput();
        print('');
        print('Usage: EJECT ALL DATABASE or EJECT DATABASE SLOT 1', 't-amber');
        print('');
        return;
    }

    if (['all database', 'all databases', 'database all', 'databases all'].includes(request)) {
        ejectAllDatabases();
        return;
    }

    const slotMatch = request.match(/(?:database\s+)?slot\s+([123])$/) || request.match(/database\s+([123])$/);
    if (slotMatch) {
        ejectDatabaseSlot(Number.parseInt(slotMatch[1], 10) - 1);
        return;
    }

    clearOutput();
    print('');
    print('EJECT COMMAND NOT RECOGNIZED', 't-red');
    print('Use EJECT ALL DATABASE or EJECT DATABASE SLOT 1 / 2 / 3.', 't-dim');
    print('');
}

function processCommand(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    // Secret commands
    if (command === 'kontol') {
        startMiniGame();
        return;
    }
    
    if (command === 'derfette') {
        startCasinoGame();
        return;
    }

    if (command === 'liebi') {
        startLiebiGame();
        return;
    }

    if (command === 'load' && args.toLowerCase() === 'status') {
        if (!adminMode) {
            printAdminRequired('LOAD STATUS');
            return;
        }
        document.getElementById('statusFileInput').click();
        return;
    }

    if (command === 'load' && args.toLowerCase() === 'file') {
        if (databaseCapacityFull()) {
            printDatabaseSlotsFull();
            return;
        }
        document.getElementById('fileInput').click();
        return;
    }

    if (command === 'load' && (!args || args.toLowerCase() === 'database')) {
        showDatabaseSelector();
        return;
    }

    if (command === 'eject') {
        handleEjectCommand(args);
        return;
    }
    
    if (command === 'sound') {
        const setting = args.toLowerCase();
        if (setting === 'on') {
            AudioEngine.setEnabled(true);
            AudioEngine.menuSelect();
            print('');
            print('SOUND ENABLED', 't-cyan');
            print('');
        } else if (setting === 'off') {
            AudioEngine.setEnabled(false);
            print('');
            print('SOUND DISABLED', 't-amber');
            print('');
        } else {
            print('');
            print('Usage: SOUND ON | SOUND OFF', 't-amber');
            print(`Current sound setting: ${AudioEngine.enabled ? 'ON' : 'OFF'}`, 't-dim');
            print('');
        }
    } else if (command === 'status') {
        const setting = args.toLowerCase();
        if (setting === 'load') {
            if (!adminMode) {
                printAdminRequired('STATUS LOAD');
                return;
            }
            document.getElementById('statusFileInput').click();
        } else if (setting === 'clear' || setting === 'reset') {
            if (!adminMode) {
                printAdminRequired('STATUS CLEAR');
                return;
            }
            clearStatusProfile();
        } else if (setting === 'format' || setting === 'help') {
            showStatusFormatHelp();
        } else if (setting === 'facility') {
            showFacilityStatus();
        } else {
            print('');
            print('Usage: STATUS LOAD | STATUS CLEAR | STATUS FORMAT', 't-amber');
            print(`Current profile: ${statusProfile.source}`, 't-dim');
            print('');
        }
    } else if (command === 'diagnostic' || command === 'diag') {
        showDiagnosticDashboard();
    } else if (
        command === 'facility' ||
        command === 'map' ||
        (command === 'status' && args.toLowerCase() === 'facility')
    ) {
        showFacilityStatus();
    } else if (command === 'help') {
        showHelp();
    } else if (command === 'clear') {
        clearOutput();
    } else if (command === 'access') {
        showAccessDialog();
    } else if (command === 'categories') {
        showCategories();
    } else if (command === 'search') {
        if (!databaseLoaded) {
            printNoDatabaseLoaded();
        } else if (args) {
            searchDatabase(args);
        } else {
            clearOutput();
            print('');
            print('Usage: SEARCH <title>', 't-amber');
            print('');
        }
    } else if (command === 'fsearch' || command === 'fuzzy') {
        if (!adminMode) {
            printAdminRequired('FUZZY SEARCH');
            return;
        }
        if (!databaseLoaded) {
            printNoDatabaseLoaded();
        } else if (args) {
            fuzzySearch(args);
        } else {
            clearOutput();
            print('');
            print('Usage: FSEARCH <term>', 't-amber');
            print('');
        }
    } else if ((command === 'list' && args.toLowerCase() === 'all') || command === 'listall') {
        if (!adminMode) {
            printAdminRequired('LIST ALL');
            return;
        }
        listAllEntries();
    } else if (command === 'logout') {
        if (!adminMode) {
            printAdminRequired('LOGOUT');
            return;
        }
        logout();
    } else {
        AudioEngine.errorBuzz();
        clearOutput();
        print('');
        print(`Unknown command: ${command}`, 't-red');
        print(contentGet('errors.unknown_command_hint', 'Use the menu to navigate commands.'), 't-dim');
        print('');
    }
}

function showWelcome() {
    clearOutput();
    const fallback = [
        '═══════════════════════════════════════════════════════',
        '              ARES MACROTECHNOLOGY',
        '═══════════════════════════════════════════════════════',
        '',
        'WELCOME, AUTHORIZED PERSONNEL ASSET.',
        '',
        'This terminal provides controlled access to Black Desert',
        'Research Facility database, diagnostic, and status systems.',
        '',
        'All employees are reminded that compliance is productivity.',
        'Productivity is margin. Margin is shareholder confidence.',
        '',
        'Obey issued directives, fulfill assigned duties, and report',
        'facility anomalies before they become expensive.',
        '',
        'Ares values dedication, discretion, and replaceable efficiency.',
        'Use HELP for command guidance.',
        '═══════════════════════════════════════════════════════'
    ];
    contentLines('welcome', fallback).forEach((line, index) => print(line, contentClass('welcome', index, index < 3 || index === fallback.length - 1 ? 't-dim' : '')));
}

function showHelp() {
    clearOutput();
    const customHelp = contentLines('help', []);
    if (customHelp.length) {
        renderHelpLinesGrouped(customHelp.map((line, index) => ({
            text: line,
            className: contentClass('help', index, '')
        })));
        return;
    }
    renderHelpLinesGrouped([
        { text: '═══════════════════════════════════════════════════════', className: 't-dim' },
        { text: '                    SYSTEM MANUAL', className: 't-bright' },
        { text: '═══════════════════════════════════════════════════════', className: 't-dim' },
        { text: '', className: '' },
        { text: 'ACCESS', className: 't-cyan' },
        { text: '  Request elevated administrator privileges.', className: '' },
        { text: '', className: '' },
        { text: 'CATEGORIES', className: 't-cyan' },
        { text: '  Show categories and visible entry counts.', className: '' },
        { text: '', className: '' },
        { text: 'CLEAR', className: 't-cyan' },
        { text: '  Clear screen; loaded data remains mounted.', className: '' },
        { text: '', className: '' },
        { text: 'DIAGNOSTIC', className: 't-cyan' },
        { text: '  Open current base diagnostic dashboard.', className: '' },
        { text: '', className: '' },
        { text: 'EJECT ALL DATABASE', className: 't-cyan' },
        { text: '  Eject every mounted database package.', className: '' },
        { text: '', className: '' },
        { text: 'EJECT DATABASE SLOT 1 / 2 / 3', className: 't-cyan' },
        { text: '  Eject one slot so another package can load.', className: '' },
        { text: '', className: '' },
        { text: 'FACILITY STATUS', className: 't-cyan' },
        { text: '  Open abstract wireframe facility overview.', className: '' },
        { text: '', className: '' },
        { text: 'LOAD DATABASE', className: 't-cyan' },
        { text: '  Open the database selector.', className: '' },
        { text: '  Up to three packages can be mounted.', className: '' },
        { text: '', className: '' },
        { text: 'LOAD FILE', className: 't-cyan' },
        { text: '  Open a local .md, .txt, or .dat database file.', className: '' },
        { text: '', className: '' },
        { text: 'SEARCH', className: 't-cyan' },
        { text: '  Query by exact entry title or entry id.', className: '' },
        { text: '', className: '' },
        { text: 'SOUND ON / SOUND OFF', className: 't-cyan' },
        { text: '  Toggle optional terminal audio.', className: '' },
        { text: '', className: '' },
        { text: 'STATUS FORMAT', className: 't-cyan' },
        { text: '  Print the editable status profile format.', className: '' },
        { text: '', className: '' },
        { text: 'WELCOME', className: 't-cyan' },
        { text: '  Display the corporate welcome notice.', className: '' },
        { text: '', className: '' },
        { text: '@pagebreak', className: '' },
        { text: '───────────────────────────────────────────────────────', className: 't-dim' },
        { text: 'ADMIN COMMANDS (requires ACCESS)', className: 't-red' },
        { text: '───────────────────────────────────────────────────────', className: 't-dim' },
        { text: '', className: '' },
        { text: 'FUZZY SEARCH - Partial match search.', className: 't-red' },
        { text: '', className: '' },
        { text: 'LIST ALL - Complete database index.', className: 't-red' },
        { text: '', className: '' },
        { text: 'LOAD STATUS / STATUS LOAD - Load status profile.', className: 't-red' },
        { text: '', className: '' },
        { text: 'LOGOUT - Terminate administrator session.', className: 't-red' },
        { text: '', className: '' },
        { text: 'STATUS CLEAR - Restore default status data.', className: 't-red' },
        { text: '', className: '' },
        { text: 'Navigation: ↑↓ Menu | ←→ Pages | Enter Select', className: 't-dim' },
        { text: '═══════════════════════════════════════════════════════', className: 't-dim' }
    ]);
}

function showCategories() {
    if (!databaseLoaded) {
        printNoDatabaseLoaded();
        return;
    }
    
    clearOutput();
    const categories = {};
    visibleDatabaseEntries().forEach(entry => {
        if (!categories[entry.category]) categories[entry.category] = 0;
        categories[entry.category]++;
    });
    
    print('');
    print('DATABASE CATEGORIES', 't-bright');
    print('═══════════════════════════════════', 't-dim');
    for (let cat in categories) {
        const cls = cat === 'CONFIDENTIAL' ? 't-magenta' : 't-cyan';
        print(`  ${cat} .................. ${categories[cat]} entries`, cls);
    }
    print('═══════════════════════════════════', 't-dim');
    print('');
}

function searchDatabase(term) {
    const searchTerm = term.toLowerCase();
    for (const entry of visibleDatabaseEntries()) {
        if (entry.title.toLowerCase() === searchTerm || String(entry.id || '').toLowerCase() === searchTerm) {
            AudioEngine.successTone();
            clearOutput();
            print('');
            print('ENTRY LOCATED', 't-bright');
            print('═══════════════════════════════════════════', 't-dim');
            printEntry(entry);
            return;
        }
    }
    AudioEngine.errorBuzz();
    clearOutput();
    print('');
    print(contentGet('errors.search_no_result', 'SEARCH QUERY RETURNED NO RESULT'), 't-red');
    print(`Query: "${term}"`, 't-dim');
    print('Search requires exact title match.', 't-dim');
    print('');
}

function fuzzySearch(term) {
    const entries = visibleDatabaseEntries(adminMode);
    const matches = fuzzySearchEntries(term, entries, adminMode);
    
    clearOutput();
    if (matches.length === 0) {
        AudioEngine.errorBuzz();
        print('');
        print(contentGet('errors.search_no_result', 'SEARCH QUERY RETURNED NO RESULT'), 't-red');
        print(`Query: "${term}"`, 't-dim');
        print('');
    } else {
        AudioEngine.successTone();
        print('');
        print(`${matches.length} MATCH${matches.length === 1 ? '' : 'ES'} FOUND`, 't-amber');
        if (lastFuzzySearchUsedFuse) print('FUZZY INDEX: FUSE.JS ONLINE', 't-dim');
        print('═══════════════════════════════════════════', 't-dim');
        matches.forEach(entry => printEntry(entry));
    }
}

function databaseFuseSignature(entries) {
    return entries
        .map(entry => [
            entry.databaseSlot || '',
            entry.id || '',
            entry.title || '',
            entry.category || '',
            entry.tags || ''
        ].join(':'))
        .join('|');
}

function getDatabaseFuse(entries, includeConfidential) {
    if (typeof window.Fuse !== 'function') return null;
    const signature = databaseFuseSignature(entries);
    if (
        databaseFuseCache.fuse &&
        databaseFuseCache.signature === signature &&
        databaseFuseCache.includeConfidential === includeConfidential
    ) {
        return databaseFuseCache.fuse;
    }

    try {
        databaseFuseCache = {
            signature,
            includeConfidential,
            fuse: new window.Fuse(entries, {
                includeScore: true,
                ignoreLocation: true,
                threshold: 0.36,
                minMatchCharLength: 2,
                keys: [
                    { name: 'title', weight: 0.42 },
                    { name: 'id', weight: 0.22 },
                    { name: 'tags', weight: 0.2 },
                    { name: 'category', weight: 0.08 },
                    { name: 'content', weight: 0.08 }
                ]
            })
        };
    } catch (error) {
        databaseFuseCache = { signature: '', includeConfidential: false, fuse: null };
        return null;
    }
    return databaseFuseCache.fuse;
}

function fuzzySearchEntries(term, entries, includeConfidential = adminMode) {
    lastFuzzySearchUsedFuse = false;
    const fuse = getDatabaseFuse(entries, includeConfidential);
    if (fuse) {
        lastFuzzySearchUsedFuse = true;
        return fuse.search(term).slice(0, 18).map(result => result.item);
    }

    const matches = [];
    const searchTerm = term.toLowerCase();
    for (const entry of entries) {
        if (String(entry.id || '').toLowerCase().includes(searchTerm) ||
            String(entry.title || '').toLowerCase().includes(searchTerm) ||
            String(entry.content || '').toLowerCase().includes(searchTerm) ||
            String(entry.tags || '').toLowerCase().includes(searchTerm) ||
            String(entry.category || '').toLowerCase().includes(searchTerm)) {
            matches.push(entry);
        }
    }
    return matches;
}

function listAllEntries() {
    if (!databaseLoaded) {
        printNoDatabaseLoaded();
        return;
    }
    
    clearOutput();
    const categories = {};
    for (const entry of databaseEntries) {
        if (!categories[entry.category]) categories[entry.category] = [];
        categories[entry.category].push(entry.title);
    }
    
    print('');
    print('COMPLETE DATABASE INDEX', 't-amber');
    print('═══════════════════════════════════════════', 't-dim');
    for (let cat in categories) {
        const cls = cat === 'CONFIDENTIAL' ? 't-magenta' : 't-cyan';
        print(`[${cat}]`, cls);
        categories[cat].forEach(title => print(`  • ${title}`));
        print('');
    }
}

function visibleDatabaseEntries(includeConfidential = adminMode) {
    return databaseEntries.filter(entry => includeConfidential || !entryRequiresAdmin(entry));
}

function entryRequiresAdmin(entry) {
    const clearance = Number.parseInt(entry.clearance || '0', 10);
    return entry.category === 'CONFIDENTIAL' || entry.confidential || clearance >= 4;
}

function printEntry(entry) {
    const cls = entryRequiresAdmin(entry) ? 't-magenta' : 't-cyan';
    print(`[${entry.category}] ${entry.title}`, cls);
    print('───────────────────────────────────────────', 't-dim');
    if (entry.id) print(`ID: ${entry.id}`, 't-dim');
    if (entry.clearance) print(`CLEARANCE: ${entry.clearance}`, 't-amber');
    if (entry.tags) print(`TAGS: ${entry.tags}`, 't-dim');
    print(entry.content);
    if (entry.related) print(`RELATED: ${entry.related}`, 't-cyan');
    if (entry.redacted) print(`REDACTED: ${entry.redacted}`, 't-red');
    print('');
}

function databaseCapacityFull() {
    return databaseSlots.every(slot => slot.loaded);
}

function firstEmptyDatabaseSlotIndex() {
    return databaseSlots.findIndex(slot => !slot.loaded);
}

function databaseSlotDisplayName(slot) {
    if (!slot || !slot.loaded) return 'NO DATABASE LOADED';
    return slot.source || slot.file || slot.metadata?.title || `DATABASE SLOT ${slot.index + 1}`;
}

function normalizeDatabaseIdentity(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/^databases[\\/]/, '')
        .replace(/\\/g, '/');
}

function databaseItemIdentities(item = {}) {
    return [
        item.id,
        item.file,
        item.filename,
        item.displayName,
        item.name
    ].map(normalizeDatabaseIdentity).filter(Boolean);
}

function parsedDatabaseIdentities(parsed = {}, item = {}, path = '') {
    return [
        parsed.metadata?.id,
        parsed.metadata?.title,
        parsed.source,
        item.id,
        item.file,
        item.filename,
        item.displayName,
        item.name,
        path
    ].map(normalizeDatabaseIdentity).filter(Boolean);
}

function databaseAlreadyMountedByIdentities(identities = []) {
    const lookup = new Set(identities.map(normalizeDatabaseIdentity).filter(Boolean));
    if (!lookup.size) return false;
    return databaseSlots.some(slot => {
        if (!slot.loaded) return false;
        return [slot.metadata?.id, slot.metadata?.title, slot.source, slot.file]
            .map(normalizeDatabaseIdentity)
            .some(identity => identity && lookup.has(identity));
    });
}

function databaseItemAlreadyMounted(item = {}) {
    return databaseAlreadyMountedByIdentities(databaseItemIdentities(item));
}

function mountParsedDatabase(parsed, item = {}, path = '') {
    if (databaseAlreadyMountedByIdentities(parsedDatabaseIdentities(parsed, item, path))) {
        AudioEngine.errorBuzz();
        clearOutput();
        print('');
        print('DATABASE ALREADY MOUNTED', 't-amber');
        print(`${parsed.metadata.title || item.displayName || parsed.source || item.file || 'Selected package'} is already loaded in a database slot.`, 't-dim');
        print('Eject that database before loading it again.', 't-dim');
        print('');
        return false;
    }

    const slotIndex = firstEmptyDatabaseSlotIndex();
    if (slotIndex < 0) {
        printDatabaseSlotsFull();
        return false;
    }

    const source = parsed.metadata.title || item.displayName || parsed.source || item.file || path || 'MARKDOWN DATABASE';
    const file = item.file || item.filename || path || parsed.source || source;
    const entries = parsed.entries.map(entry => ({
        ...entry,
        databaseSlot: slotIndex + 1,
        databaseSource: source,
        databaseFile: file
    }));

    databaseSlots[slotIndex] = {
        index: slotIndex,
        loaded: true,
        source,
        file,
        metadata: { ...parsed.metadata },
        entries
    };

    rebuildDatabaseIndex();
    AudioEngine.dataLoaded();
    clearOutput();
    print('');
    print('DATABASE AUTHENTICATED', 't-cyan');
    print(`Slot ${slotIndex + 1}: ${source}`, 't-amber');
    print(`Entries loaded: ${entries.length}`, 't-cyan');
    print(`Mounted packages: ${databaseSlots.filter(slot => slot.loaded).length}/${DATABASE_SLOT_COUNT}`, 't-dim');
    print('');
    print('Use SEARCH, CATEGORIES, or admin LIST ALL to explore.', 't-dim');
    print('');
    return true;
}

function rebuildDatabaseIndex() {
    database = {};
    databaseEntries = [];
    databaseFuseCache = {
        signature: '',
        includeConfidential: false,
        fuse: null
    };
    databaseSlots.forEach(slot => {
        if (!slot.loaded) return;
        slot.entries.forEach(entry => {
            databaseEntries.push(entry);
            const titleKey = String(entry.title || '').toLowerCase();
            if (titleKey && !database[titleKey]) database[titleKey] = entry;
            const idKey = String(entry.id || '').toLowerCase();
            if (idKey && !database[idKey]) database[idKey] = entry;
        });
    });

    databaseLoaded = databaseEntries.length > 0;
    databaseSource = databaseSlots
        .filter(slot => slot.loaded)
        .map(slot => databaseSlotDisplayName(slot))
        .join(', ') || 'NO DATABASE';
    updateEntryCount();
    updateDatabaseSlotIndicators();
}

function updateDatabaseSlotIndicators() {
    databaseSlots.forEach((slot, index) => {
        const button = document.querySelector(`.database-slot-button[data-slot="${index}"]`);
        if (!button) return;
        button.classList.toggle('loaded', slot.loaded);
        button.classList.toggle('empty', !slot.loaded);
        button.title = slot.loaded
            ? `Slot ${index + 1}: ${databaseSlotDisplayName(slot)}`
            : `Slot ${index + 1}: empty`;
        button.setAttribute('aria-label', slot.loaded
            ? `Database slot ${index + 1} loaded: ${databaseSlotDisplayName(slot)}`
            : `Database slot ${index + 1} empty`);
    });
}

function showDatabaseSlotDialog(slotIndex) {
    const safeIndex = Math.max(0, Math.min(DATABASE_SLOT_COUNT - 1, Number.parseInt(slotIndex, 10) || 0));
    const slot = databaseSlots[safeIndex];
    const { body } = createDatabaseModal(`DATABASE SLOT ${safeIndex + 1}`);
    body.textContent = '';

    const status = document.createElement('p');
    status.className = `database-modal-copy ${slot.loaded ? 't-cyan' : 't-red'}`;
    status.textContent = slot.loaded ? 'STATUS: DATABASE LOADED' : 'STATUS: NO DATABASE LOADED';

    const details = document.createElement('pre');
    details.className = 'database-slot-details';
    details.textContent = slot.loaded
        ? [
            `SLOT        : ${safeIndex + 1}`,
            `DATABASE    : ${databaseSlotDisplayName(slot)}`,
            `FILE        : ${slot.file || 'UNKNOWN'}`,
            `ENTRIES     : ${slot.entries.length}`,
            `CLEARANCE   : ${slot.metadata.password ? 'PASSWORD GATED' : 'OPEN'}`
        ].join('\n')
        : [
            `SLOT        : ${safeIndex + 1}`,
            'DATABASE    : NONE',
            'ENTRIES     : 0',
            'STATUS      : EMPTY / READY'
        ].join('\n');

    const actions = document.createElement('div');
    actions.className = 'database-modal-actions';
    const abort = document.createElement('button');
    abort.className = 'database-modal-action secondary';
    abort.type = 'button';
    abort.textContent = 'ABORT';
    abort.addEventListener('click', closeDatabaseModal);
    const eject = document.createElement('button');
    eject.className = 'database-modal-action';
    eject.type = 'button';
    eject.textContent = 'EJECT DATABASE';
    eject.disabled = !slot.loaded;
    eject.addEventListener('click', () => {
        ejectDatabaseSlot(safeIndex);
        closeDatabaseModal();
    });
    actions.append(abort, eject);
    body.append(status, details, actions);
    abort.focus();
}

function ejectDatabaseSlot(slotIndex, options = {}) {
    const safeIndex = Number.parseInt(slotIndex, 10);
    if (!Number.isFinite(safeIndex) || safeIndex < 0 || safeIndex >= DATABASE_SLOT_COUNT) return false;
    const slot = databaseSlots[safeIndex];
    if (!slot.loaded) {
        if (!options.silent) {
            AudioEngine.errorBuzz();
            clearOutput();
            print('');
            print(`DATABASE SLOT ${safeIndex + 1} IS EMPTY`, 't-amber');
            print('');
        }
        return false;
    }

    const source = databaseSlotDisplayName(slot);
    databaseSlots[safeIndex] = {
        index: safeIndex,
        loaded: false,
        source: '',
        file: '',
        metadata: {},
        entries: []
    };
    rebuildDatabaseIndex();
    AudioEngine.pageFlip();
    if (!options.silent) {
        clearOutput();
        print('');
        print(`DATABASE SLOT ${safeIndex + 1} EJECTED`, 't-amber');
        print(`Database: ${source}`, 't-dim');
        print(`Mounted packages: ${databaseSlots.filter(item => item.loaded).length}/${DATABASE_SLOT_COUNT}`, 't-cyan');
        print('');
    }
    return true;
}

function ejectAllDatabases() {
    const loadedCount = databaseSlots.filter(slot => slot.loaded).length;
    if (!loadedCount) {
        AudioEngine.errorBuzz();
        clearOutput();
        print('');
        print('NO DATABASES LOADED', 't-amber');
        print('');
        return;
    }

    databaseSlots = databaseSlots.map((slot, index) => ({
        index,
        loaded: false,
        source: '',
        file: '',
        metadata: {},
        entries: []
    }));
    rebuildDatabaseIndex();
    AudioEngine.pageFlip();
    clearOutput();
    print('');
    print('ALL DATABASE SLOTS EJECTED', 't-amber');
    print(`Packages ejected: ${loadedCount}`, 't-dim');
    print('');
}

// ========================================
// STATUS PROFILE LOADER
// ========================================
function normalizeStatusKey(key) {
    return String(key || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9._-]/g, '');
}

function cleanStatusValue(value) {
    let cleaned = String(value || '').trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    return cleaned.replace(/\\n/g, '\n');
}

function parseTerminalBlockLine(rawLine) {
    const styles = {
        dim: 't-dim',
        bright: 't-bright',
        cyan: 't-cyan',
        amber: 't-amber',
        red: 't-red',
        magenta: 't-magenta'
    };
    const match = String(rawLine ?? '').match(/^@([a-z]+)\s?(.*)$/i);
    if (!match) return { text: String(rawLine ?? ''), className: '' };
    const className = styles[match[1].toLowerCase()];
    return className
        ? { text: match[2], className }
        : { text: String(rawLine ?? ''), className: '' };
}

function parseStatusProfile(content, source) {
    const values = {};
    let section = '';
    let blockSection = '';
    let blockLine = 1;
    let inTextBlock = false;

    String(content || '').replace(/\r/g, '').split('\n').forEach(rawLine => {
        let line = rawLine.trim();

        if (line.startsWith('```')) {
            inTextBlock = !inTextBlock;
            if (inTextBlock) {
                blockSection = section;
                blockLine = 1;
            }
            return;
        }

        if (inTextBlock) {
            if (!blockSection) return;
            const parsed = parseTerminalBlockLine(rawLine);
            values[`${blockSection}.line${blockLine}`] = parsed.text;
            if (parsed.className) values[`${blockSection}.class${blockLine}`] = parsed.className;
            blockLine++;
            return;
        }

        if (!line || line === '---') return;

        const iniSection = line.match(/^\[([a-z0-9_.\-\s]+)\]$/i);
        if (iniSection) {
            section = normalizeStatusKey(iniSection[1]);
            return;
        }

        const markdownSection = line.match(/^#{2,6}\s+([a-z0-9_.-]+)\s*$/i);
        if (markdownSection) {
            section = normalizeStatusKey(markdownSection[1]);
            return;
        }

        if (line.startsWith('#') || line.startsWith('//') || line.startsWith('<!--')) return;
        line = line.replace(/^[-*]\s+/, '');

        const pair = line.match(/^([a-z0-9_.-]+)\s*(?:=|:)\s*(.*)$/i);
        if (!pair) return;

        let key = normalizeStatusKey(pair[1]);
        if (!key) return;
        if (section && !key.includes('.')) key = `${section}.${key}`;
        values[key] = cleanStatusValue(pair[2]);
    });

    return {
        source: source || 'STATUS PROFILE',
        loaded: Object.keys(values).length > 0,
        values
    };
}

function loadStoredStatusProfile() {
    try {
        const stored = JSON.parse(localStorage.getItem(STATUS_PROFILE_STORAGE_KEY) || 'null');
        if (!stored || !stored.content) return;
        const profile = parseStatusProfile(stored.content, stored.source || 'STORED STATUS PROFILE');
        if (profile.loaded) setStatusProfile(profile);
    } catch (error) {
        try { localStorage.removeItem(STATUS_PROFILE_STORAGE_KEY); } catch (storageError) {}
    }
}

function persistStatusProfile(profile, content) {
    try {
        localStorage.setItem(STATUS_PROFILE_STORAGE_KEY, JSON.stringify({
            source: profile.source,
            content
        }));
    } catch (error) {}
}

function clearStoredStatusProfile() {
    try { localStorage.removeItem(STATUS_PROFILE_STORAGE_KEY); } catch (error) {}
}

function statusGet(key, fallback = '') {
    const normalized = normalizeStatusKey(key);
    const value = statusProfile.values[normalized];
    if (value !== undefined && value !== '') return value;
    const contentValue = terminalContent.values[normalized];
    return contentValue === undefined || contentValue === '' ? fallback : contentValue;
}

function statusNumber(key, fallback = 0, min = -Infinity, max = Infinity) {
    const value = Number.parseFloat(statusGet(key, fallback));
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, value));
}

function statusBool(key, fallback = true) {
    const rawValue = statusGet(key, fallback ? 'true' : 'false');
    const value = normalizeStatusKey(rawValue);
    if (['false', '0', 'no', 'off', 'disabled', 'hidden'].includes(value)) return false;
    if (['true', '1', 'yes', 'on', 'enabled', 'visible'].includes(value)) return true;
    return fallback;
}

function statusState(key, fallback = 'ok') {
    const value = normalizeStatusKey(statusGet(key, fallback));
    if (['alert', 'critical', 'danger', 'red', 'fail', 'failed', 'breach', 'unknown', 'offline', 'malfunction', 'disconnected'].includes(value)) return 'alert';
    if (['warn', 'warning', 'amber', 'degraded', 'maintenance', 'service', 'partial', 'low', 'weak', 'intermittent', 'armed'].includes(value)) return 'warn';
    return 'ok';
}

function statusSectionIds(prefix) {
    const prefixKey = `${normalizeStatusKey(prefix)}.`;
    const cached = statusSectionIdCache.get(prefixKey);
    if (cached) return cached.slice();

    const ids = new Set();
    if (!statusProfileKeyCache) {
        statusProfileKeyCache = Array.from(new Set([
            ...Object.keys(terminalContent.values),
            ...Object.keys(statusProfile.values)
        ]));
    }
    statusProfileKeyCache.forEach(key => {
        if (!key.startsWith(prefixKey)) return;
        const id = key.slice(prefixKey.length).split('.')[0];
        if (id) ids.add(id);
    });
    const result = Array.from(ids);
    statusSectionIdCache.set(prefixKey, result);
    return result.slice();
}

function sortStatusIds(a, b) {
    const an = Number.parseInt(a, 10);
    const bn = Number.parseInt(b, 10);
    if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
    return a.localeCompare(b);
}

async function loadTerminalContent() {
    try {
        const response = await fetch('content/terminal-content.md', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const content = await response.text();
        const profile = parseStatusProfile(content, 'content/terminal-content.md');
        setTerminalContent(profile);
    } catch (error) {
        setTerminalContent({ loaded: false, values: {} });
    }
}

function contentGet(key, fallback = '') {
    const normalized = normalizeStatusKey(key);
    const value = terminalContent.values[normalized];
    return value === undefined || value === '' ? fallback : value;
}

function contentLines(prefix, fallbackLines = []) {
    const lines = [];
    for (let i = 1; i <= 120; i++) {
        const key = normalizeStatusKey(`${prefix}.line${i}`);
        if (Object.prototype.hasOwnProperty.call(terminalContent.values, key)) {
            lines.push(terminalContent.values[key]);
        }
    }
    if (lines.length) return lines;

    const packed = contentGet(`${prefix}.lines`, '');
    if (packed) {
        return packed.split('|').map(line => line.trim()).filter(Boolean);
    }
    return fallbackLines.slice();
}

function contentClass(prefix, index, fallback = '') {
    return contentGet(`${prefix}.class${index + 1}`, fallback);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getBootLogoMarkup(fallbackMarkup) {
    const lines = contentLines('boot.logo', []);
    if (!lines.length) return fallbackMarkup;
    return lines
        .map((line, index) => {
            const className = contentClass('boot.logo', index, '')
                .split(/\s+/)
                .filter(name => /^t-[a-z]+$/i.test(name))
                .join(' ');
            const classAttr = className ? ` class="${escapeHtml(className)}"` : '';
            return `<span${classAttr}>${escapeHtml(line)}</span>`;
        })
        .join('\n');
}

function applyTerminalContentToDom() {
    const title = contentGet('terminal.title', '');
    if (title) {
        document.title = title;
        document.querySelectorAll('.system-title').forEach(element => { element.textContent = title; });
    }

    const build = contentGet('terminal.build', '');
    if (build) {
        document.querySelectorAll('.header-info .hl').forEach((element, index) => {
            if (index === 0) element.textContent = build;
        });
    }

    const diagnosticTitle = contentGet('diagnostic.title', '');
    if (diagnosticTitle) {
        const element = getById('diagnosticTitle');
        if (element) element.textContent = diagnosticTitle;
    }
    const facilityTitle = contentGet('facility.title', '');
    if (facilityTitle) {
        const element = getById('facilityTitle');
        if (element) element.textContent = facilityTitle;
    }
    const accessError = contentGet('admin.access_denied', '');
    if (accessError) {
        const element = getById('accessError');
        if (element) element.textContent = accessError;
    }

    document.querySelectorAll('.menu-item[data-cmd]').forEach(item => {
        const label = contentGet(`commands.${item.dataset.cmd}`, '');
        const labelElement = item.querySelector('span:not(.icon)');
        if (label && labelElement) labelElement.textContent = label.toUpperCase();
    });

    const diagnosticLabels = {
        diagNetworkCard: 'diagnostic.label.network',
        diagSecurityCard: 'diagnostic.label.security',
        diagOutpostCard: 'diagnostic.label.outposts',
        diagGeneratorCard: 'diagnostic.label.generator',
        diagPowerCard: 'diagnostic.label.power',
        diagAlarmCard: 'diagnostic.label.alarm',
        diagLifeCard: 'diagnostic.label.life'
    };
    Object.entries(diagnosticLabels).forEach(([cardId, key]) => {
        const card = getById(cardId);
        const label = contentGet(key, '');
        const span = card ? card.querySelector('.diagnostic-label span:first-child') : null;
        if (label && span) span.textContent = label.toUpperCase();
    });

    const facilityLabels = {
        facilityOverview: 'facility.label.overview',
        facilityZones: 'facility.label.zones',
        facilityContacts: 'facility.label.contacts'
    };
    Object.entries(facilityLabels).forEach(([readoutId, key]) => {
        const readout = getById(readoutId);
        const label = contentGet(key, '');
        const titleElement = readout ? readout.closest('.facility-card')?.querySelector('.facility-card-title') : null;
        if (label && titleElement) titleElement.textContent = label.toUpperCase();
    });
}

function getBootSequence() {
    const stepIds = statusSectionIds('boot.step').sort(sortStatusIds);
    if (!stepIds.length) return DEFAULT_BOOT_SEQUENCE.map(step => ({ ...step }));

    const sequence = stepIds.map(id => {
        const prefix = `boot.step.${id}`;
        if (!statusBool(`${prefix}.enabled`, true)) return null;
        const type = normalizeStatusKey(statusGet(`${prefix}.type`, 'line'));
        if (type === 'pause') {
            return {
                type: 'pause',
                duration: Math.max(0, Math.round(statusNumber(`${prefix}.duration`, 160, 0, 20000)))
            };
        }
        if (type === 'blank') return { type: 'blank' };
        if (type === 'section') {
            return {
                type: 'section',
                text: statusGet(`${prefix}.text`, '')
            };
        }
        if (type === 'check') {
            return {
                type: 'check',
                label: statusGet(`${prefix}.label`, 'SYSTEM CHECK'),
                result: statusGet(`${prefix}.result`, 'OK'),
                status: normalizeStatusKey(statusGet(`${prefix}.status`, 'ok')),
                final: statusBool(`${prefix}.final`, false)
            };
        }
        return {
            type: 'line',
            text: statusGet(`${prefix}.text`, ''),
            className: statusGet(`${prefix}.class`, statusGet(`${prefix}.className`, ''))
        };
    }).filter(Boolean);

    return sequence.length ? sequence : DEFAULT_BOOT_SEQUENCE.map(step => ({ ...step }));
}

function statusLineGroup(prefix) {
    const cacheKey = normalizeStatusKey(prefix);
    const cached = statusLineGroupCache.get(cacheKey);
    if (cached) return cached.slice();

    const lines = [];
    for (let i = 1; i <= 12; i++) {
        const value = statusGet(`${prefix}.line${i}`, null);
        if (value !== null) lines.push(value);
    }

    if (!lines.length) {
        const packed = statusGet(`${prefix}.lines`, '');
        if (packed) {
            packed.split('|')
                .map(line => line.trim())
                .filter(Boolean)
                .forEach(line => lines.push(line));
        }
    }

    statusLineGroupCache.set(cacheKey, lines);
    return lines.slice();
}

function statusInterpolate(text, frame) {
    return String(text)
        .replace(/\{spinner\}/gi, spinner(frame))
        .replace(/\{sweep(?::(\d+))?\}/gi, (_, width) => asciiSweep(frame, Number(width) || 20))
        .replace(/\{graph(?::(\d+))?\}/gi, (_, width) => asciiGraph(frame, Number(width) || 22))
        .replace(/\{heartbeat(?::(\d+))?\}/gi, (_, width) => heartbeat(frame, Number(width) || 38))
        .replace(/\{bar:([a-z0-9_.-]+)(?::(\d+))?\}/gi, (_, key, width) => asciiBar(statusNumber(key, 0, 0, 100), Number(width) || 18))
        .replace(/\{value:([a-z0-9_.-]+)\}/gi, (_, key) => statusGet(key, ''));
}

function statusBlock(prefix, fallbackLines, frame) {
    const customLines = statusLineGroup(prefix);
    return (customLines.length ? customLines : fallbackLines)
        .map(line => statusInterpolate(line, frame))
        .join('\n');
}

function refreshStatusPanels() {
    if (diagnosticActive) {
        diagnosticFrame = Math.max(diagnosticFrame, prefersReducedMotion ? 24 : 12);
        renderDiagnosticDashboard();
    }
    if (facilityActive) {
        facilityFrame = Math.max(facilityFrame, prefersReducedMotion ? 24 : 10);
        renderFacilityStatus(performance.now());
    }
}

function pauseRealtimePanels() {
    if (diagnosticAnimFrame) {
        cancelAnimationFrame(diagnosticAnimFrame);
        diagnosticAnimFrame = null;
    }
    if (facilityAnimFrame) {
        cancelAnimationFrame(facilityAnimFrame);
        facilityAnimFrame = null;
    }
}

function resumeRealtimePanels() {
    if (prefersReducedMotion) return;
    if (diagnosticActive && !diagnosticAnimFrame) {
        diagnosticLastRender = 0;
        diagnosticAnimFrame = requestAnimationFrame(runDiagnosticLoop);
    }
    if (facilityActive && !facilityAnimFrame) {
        facilityLastRender = 0;
        facilityAnimFrame = requestAnimationFrame(runFacilityLoop);
    }
}

function handleVisibilityChange() {
    if (document.hidden) {
        pauseRealtimePanels();
    } else {
        resumeRealtimePanels();
    }
}

function clearStatusProfile() {
    setStatusProfile({
        source: 'INTERNAL DEFAULT',
        loaded: false,
        values: {}
    });
    clearStoredStatusProfile();
    AudioEngine.pageFlip();
    refreshStatusPanels();
    print('');
    print('STATUS PROFILE CLEARED', 't-amber');
    print('Diagnostic and facility panels returned to internal defaults.', 't-dim');
    print('Stored boot/status override removed for the next page load.', 't-dim');
    print('');
}

function showStatusFormatHelp() {
    clearOutput();
    print('═══════════════════════════════════════════════════════', 't-dim');
    print('                STATUS PROFILE FORMAT', 't-bright');
    print('═══════════════════════════════════════════════════════', 't-dim');
    print('');
    print('Use a .txt, .md, or encrypted .dat file with [section] headers and key = value lines.', 't-cyan');
    print('You can also use Markdown headings like ## diagnostic.network.', 't-dim');
    print('Boot overrides are applied on the next page load after STATUS LOAD.', 't-dim');
    print('');
    print('[boot.step.001]', 't-amber');
    print('type = check');
    print('label = EXTERNAL RELAY');
    print('result = FAILED');
    print('status = unknown');
    print('');
    print('[facility.grid]', 't-amber');
    print('id = BDR-01');
    print('structure = 77');
    print('power = 61');
    print('reserve = 34');
    print('repair = 06 OPEN');
    print('');
    print('[facility.zone.lab]', 't-amber');
    print('state = alert');
    print('status = BIO TRACE');
    print('load = 42');
    print('');
    print('[diagnostic.network]', 't-amber');
    print('state = alert');
    print('status = DISCONNECTED');
    print('level = 62');
    print('line1 = FACILITY BUS : LOCAL ONLY {spinner}');
    print('line2 = LOCAL MESH   : {bar:diagnostic.network.level:18}');
    print('line3 = EXT RELAY    : FAILED / NO CARRIER');
    print('');
    print('Tokens: {spinner}, {sweep:20}, {graph:22}, {heartbeat:38},', 't-dim');
    print('        {bar:path.to.number:18}, {value:path.to.key}', 't-dim');
    print('');
    print('Commands: STATUS LOAD, STATUS CLEAR, STATUS FORMAT', 't-cyan');
    print('═══════════════════════════════════════════════════════', 't-dim');
}

// ========================================
// DIAGNOSTIC DASHBOARD
// ========================================
function diagText(id, value) {
    const element = getById(id);
    if (element && element.textContent !== value) element.textContent = value;
}

function diagCardState(id, state = 'ok') {
    const card = getById(id);
    if (!card) return;
    card.classList.toggle('warn', state === 'warn');
    card.classList.toggle('alert', state === 'alert');
}

function asciiBar(value, width = 18) {
    const safeValue = Math.max(0, Math.min(100, Math.round(value)));
    const filled = Math.round((safeValue / 100) * width);
    return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}] ${String(safeValue).padStart(3, '0')}%`;
}

function asciiSweep(frame, width = 24) {
    const pos = Math.abs((frame % (width * 2 - 2)) - (width - 1));
    let output = '';
    for (let i = 0; i < width; i++) output += i === pos ? 'X' : '.';
    return `[${output}]`;
}

function asciiGraph(frame, width = 28) {
    const chars = '._-~=+#';
    let output = '';
    for (let i = 0; i < width; i++) {
        const level = Math.abs(Math.sin((frame + i) * 0.42) + Math.sin((frame * 0.55 + i) * 0.19));
        output += chars[Math.min(chars.length - 1, Math.floor(level * 3.2))];
    }
    return output;
}

function spinner(frame) {
    return ['|', '/', '-', '\\'][frame % 4];
}

function diagnosticLoading(label, frame) {
    const progress = Math.min(99, 16 + frame * 7);
    return [
        `> LOADING ${label}`,
        `  BUS ${asciiBar(progress, 20)}`,
        `  SEEK ${asciiSweep(frame, 22)}`,
        '  WAITING FOR SENSOR ACK...',
        `  DATA ${asciiGraph(frame, 26)}`,
        '  STATUS      : HOLDING'
    ].join('\n');
}

function lifeSignMap(frame) {
    const dots = ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'];
    const liveA = frame % dots.length;
    const liveB = (frame * 2 + 5) % dots.length;
    const unstable = (frame * 3 + 9) % dots.length;
    dots[liveA] = 'o';
    dots[liveB] = 'o';
    dots[unstable] = '!';
    return [
        '+--A-DECK-------------+  +--B-DECK-------------+',
        `| ${dots[0]}  LAB-1   ${dots[1]}  ${dots[2]} |  | ${dots[3]} MED     ${dots[4]}   |`,
        '|    [CORE]     .    |  |    HAB BLOCK       |',
        `| ${dots[5]}  ACCESS  ${dots[6]}  ${dots[7]} |  | ${dots[8]} CRYO    ${dots[9]}  ${dots[10]} |`,
        '+---------------------+  +---------------------+',
        `LOWER SERVICE TUNNEL TRACE: ${dots[11]}`
    ].join('\n');
}

function heartbeat(frame, width = 44) {
    const pattern = '__/\\/\\____/\\___';
    let output = '';
    for (let i = 0; i < width; i++) output += pattern[(frame + i) % pattern.length];
    return output;
}

function renderDiagnosticDashboard() {
    const frame = diagnosticFrame;
    const loading = !prefersReducedMotion && frame < 12;
    const phase = prefersReducedMotion ? 24 : frame;
    const scanProgress = loading ? Math.min(99, frame * 8) : 100;
    const meta = loading
        ? `SCAN BUS: CALIBRATING ${asciiBar(scanProgress, 12)}`
        : `SCAN BUS: LIVE // FRAME ${String(frame).padStart(4, '0')}`;
    diagText('diagnosticMeta', meta);

    if (loading) {
        diagText('diagnosticTicker', `BASE SENSOR HANDSHAKE ${spinner(frame)} ${asciiSweep(frame, 18)}`);
        [
            ['diagNetwork', 'FACILITY COMMS'],
            ['diagSecurity', 'DEFENSE GRID'],
            ['diagOutpost', 'RELAY / DRONE LINKS'],
            ['diagGenerator', 'GENERATOR CORE'],
            ['diagPower', 'POWER RESERVES'],
            ['diagAlarm', 'ALARMS / DIS SENSORS'],
            ['diagLife', 'BIO SIGNATURES']
        ].forEach(([id, label]) => diagText(id, diagnosticLoading(label, frame)));
        ['diagNetworkStatus','diagSecurityStatus','diagOutpostStatus','diagGeneratorStatus','diagPowerStatus','diagAlarmStatus','diagLifeStatus']
            .forEach(id => diagText(id, 'SCAN'));
        ['diagNetworkCard','diagSecurityCard','diagOutpostCard','diagGeneratorCard','diagPowerCard','diagAlarmCard','diagLifeCard']
            .forEach(id => diagCardState(id, 'ok'));
        return;
    }

    const network = statusNumber('diagnostic.network.level', 69 + Math.round(Math.sin(phase * 0.31) * 5), 0, 100);
    const security = statusNumber('diagnostic.security.level', 81 + Math.round(Math.sin(phase * 0.18) * 4), 0, 100);
    const generator = statusNumber('diagnostic.generator.level', 62 + Math.round(Math.sin(phase * 0.22) * 6), 0, 100);
    const mainPower = statusNumber('diagnostic.power.main', 61 + Math.round(Math.sin(phase * 0.16) * 4), 0, 100);
    const reservePower = statusNumber('diagnostic.power.reserve', 34 + Math.round(Math.cos(phase * 0.12) * 5), 0, 100);
    const lifeCount = Math.round(statusNumber('diagnostic.life.known', 14 + (phase % 9 === 0 ? 1 : 0), 0, 99));
    const unstableLife = Math.round(statusNumber('diagnostic.life.unstable', 2, 0, 99));
    const unknownLife = Math.round(statusNumber('diagnostic.life.unknown', 3 + (phase % 11 === 0 ? 1 : 0), 0, 99));

    const networkStatus = statusGet('diagnostic.network.status', 'DISCONNECTED').toUpperCase();
    diagCardState('diagNetworkCard', statusState('diagnostic.network.state', 'alert'));
    diagText('diagNetworkStatus', networkStatus);
    diagText('diagNetwork', statusBlock('diagnostic.network', [
        `FACILITY BUS : LOCAL ONLY ${spinner(phase)}`,
        `LOCAL MESH   : ${asciiBar(network, 18)}`,
        `SURFACE NET  : ${statusGet('diagnostic.network.surface', 'DISCONNECTED')}`,
        `EXT RELAY    : ${statusGet('diagnostic.network.relay', 'FAILED / NO CARRIER')}`,
        `DRONE UPLINK : ${statusGet('diagnostic.network.drone', 'DEGRADED 77%')}`
    ], phase));

    const securityStatus = statusGet('diagnostic.security.status', 'ARMED').toUpperCase();
    diagCardState('diagSecurityCard', statusState('diagnostic.security.state', 'warn'));
    diagText('diagSecurityStatus', securityStatus);
    diagText('diagSecurity', statusBlock('diagnostic.security', [
        `PERIMETER    : ${asciiBar(security, 18)}`,
        `SEC PROTOCOL : ${statusGet('diagnostic.security.protocol', 'ENGAGED')}`,
        `AUTO DEFENSE : ${statusGet('diagnostic.security.defense', 'ARMED')}`,
        `INTRUSION    : ${statusGet('diagnostic.security.intrusion', 'ARMED / NO BREACH')}`,
        `VAULT DOORS  : ${statusGet('diagnostic.security.vault', 'SEALED / SERVO-3 SLOW')}`
    ], phase));

    const outpostStatus = statusGet('diagnostic.outposts.status', 'LINK DEGRADED').toUpperCase();
    diagCardState('diagOutpostCard', statusState('diagnostic.outposts.state', 'warn'));
    diagText('diagOutpostStatus', outpostStatus);
    diagText('diagOutpost', statusBlock('diagnostic.outposts', [
        `LINK SWEEP   : ${asciiSweep(phase, 22)}`,
        `DRONE UPLINK : ${statusGet('diagnostic.outposts.drone', 'DEGRADED 77%')}`,
        `MESH NETWORK : ${statusGet('diagnostic.outposts.mesh', 'WEAK SIGNAL')}`,
        `OUTPOST-01   : ${statusGet('diagnostic.outposts.outpost1', 'PARTIAL MESH  188ms')}`,
        `OUTPOST-04   : ${statusGet('diagnostic.outposts.outpost4', 'NO CARRIER    ----')}`
    ], phase));

    const generatorStatus = statusGet('diagnostic.generator.status', 'SERVICE DUE').toUpperCase();
    diagCardState('diagGeneratorCard', statusState('diagnostic.generator.state', 'warn'));
    diagText('diagGeneratorStatus', generatorStatus);
    diagText('diagGenerator', statusBlock('diagnostic.generator', [
        `CORE-A ${spinner(phase)}      : ${statusGet('diagnostic.generator.core', 'RUNNING HOT')}`,
        `TURBINE RPM  : ${asciiBar(generator, 18)}`,
        `TEMP         : ${statusGet('diagnostic.generator.temp', '451K ABOVE NOMINAL')}`,
        `LOAD BUS     : ${asciiSweep(phase + 6, 22)}`,
        `COOLANT      : ${statusGet('diagnostic.generator.coolant', 'FLOW LOW / FILTER CLOG')}`
    ], phase));

    const powerStatus = statusGet('diagnostic.power.status', 'LOW RESERVE').toUpperCase();
    diagCardState('diagPowerCard', statusState('diagnostic.power.state', 'warn'));
    diagText('diagPowerStatus', powerStatus);
    diagText('diagPower', statusBlock('diagnostic.power', [
        `MAIN GRID    : ${asciiBar(mainPower, 20)}`,
        `RESERVE CELL : ${asciiBar(reservePower, 20)}`,
        `BAT-A        : ${statusGet('diagnostic.power.bat_a', `[${'#'.repeat(4)}${'-'.repeat(6)}] 3.2h`)}`,
        `BAT-B        : ${statusGet('diagnostic.power.bat_b', `[${'#'.repeat(3)}${'-'.repeat(7)}] 2.6h`)}`,
        `CAPACITOR    : ${statusGet('diagnostic.power.capacitor', `UNEVEN CHARGE ${'.'.repeat((phase % 3) + 1).padEnd(3, ' ')}`)}`
    ], phase));

    const alarmStatus = statusGet('diagnostic.alarm.status', 'DIS DEGRADED').toUpperCase();
    diagCardState('diagAlarmCard', statusState('diagnostic.alarm.state', 'malfunction'));
    diagText('diagAlarmStatus', alarmStatus);
    diagText('diagAlarm', statusBlock('diagnostic.alarm', [
        `STATION ALARM: ${statusGet('diagnostic.alarm.station', 'AMBER MAINTENANCE')}`,
        `DIS SENSORS  : ${statusGet('diagnostic.alarm.dis', 'DEGRADED / 02 BLIND')}`,
        `BIOHAZARD    : ${statusGet('diagnostic.alarm.biohazard', 'CLEAR / SAMPLE LOCK DUE')}`,
        `CONTAINMENT  : ${statusGet('diagnostic.alarm.containment', 'ZONE C-12 SEAL DRIFT')}`,
        `SIREN BUS    : ${asciiSweep(phase + 10, 22)}`
    ], phase));

    const lifeStatus = statusGet('diagnostic.life.status', `${unknownLife} UNKNOWN`).toUpperCase();
    diagCardState('diagLifeCard', statusState('diagnostic.life.state', 'alert'));
    diagText('diagLifeStatus', lifeStatus);
    diagText('diagLife', statusBlock('diagnostic.life', [
        `BIO COUNT    : ${String(lifeCount).padStart(2, '0')} CONFIRMED / ${String(unstableLife).padStart(2, '0')} UNSTABLE / ${String(unknownLife).padStart(2, '0')} UNKNOWN`,
        `HEARTBEAT    : ${heartbeat(phase)}`,
        lifeSignMap(phase)
    ], phase));

    const defaultTicker = `FACILITY PASS: EXTERNAL COMMS DOWN // DEFENSE ARMED // DIS SENSORS DEGRADED // UNKNOWN LIFE SIGNS ${spinner(phase)} ${asciiSweep(phase, 20)}`;
    diagText('diagnosticTicker', statusInterpolate(statusGet('diagnostic.ticker', defaultTicker), phase));
}

function runDiagnosticLoop(timestamp = 0) {
    if (!diagnosticActive) return;
    const interval = 135;
    if (!diagnosticLastRender || timestamp - diagnosticLastRender >= interval) {
        diagnosticLastRender = timestamp;
        diagnosticFrame++;
        renderDiagnosticDashboard();
        if (diagnosticFrame < 16 && diagnosticFrame % 3 === 0) AudioEngine.keyClick();
    }
    diagnosticAnimFrame = requestAnimationFrame(runDiagnosticLoop);
}

function showDiagnosticDashboard() {
    const overlay = document.getElementById('diagnosticOverlay');
    if (!overlay || overlay.classList.contains('active')) return;
    diagnosticActive = true;
    diagnosticFrame = prefersReducedMotion ? 24 : 0;
    diagnosticLastRender = 0;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    renderDiagnosticDashboard();
    AudioEngine.bootBeep();
    Animator.dialogOpen(overlay);
    if (!prefersReducedMotion) {
        diagnosticAnimFrame = requestAnimationFrame(runDiagnosticLoop);
    }
}

function closeDiagnosticDashboard() {
    const overlay = document.getElementById('diagnosticOverlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    diagnosticActive = false;
    if (diagnosticAnimFrame) {
        cancelAnimationFrame(diagnosticAnimFrame);
        diagnosticAnimFrame = null;
    }
    AudioEngine.pageFlip();
    Animator.dialogClose(overlay, () => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    });
}

// ========================================
// FACILITY STATUS WIREFRAME
// ========================================
const FACILITY_ZONES = [
    { id: 'core', label: 'CMD CORE', status: 'NOMINAL', state: 'ok', x: 0.42, y: 0.34, w: 0.17, h: 0.15, load: 78, pulse: 0 },
    { id: 'lab', label: 'LAB ARC', status: 'SEAL DRIFT', state: 'warn', x: 0.18, y: 0.22, w: 0.18, h: 0.14, load: 64, pulse: 1.1 },
    { id: 'med', label: 'MED BAY', status: 'STANDBY', state: 'ok', x: 0.65, y: 0.20, w: 0.16, h: 0.13, load: 71, pulse: 2.2 },
    { id: 'hab', label: 'HAB RING', status: 'LOW HEAT', state: 'warn', x: 0.68, y: 0.48, w: 0.18, h: 0.15, load: 67, pulse: 3.3 },
    { id: 'gen', label: 'GEN PLANT', status: 'SERVICE', state: 'warn', x: 0.19, y: 0.52, w: 0.19, h: 0.15, load: 61, pulse: 4.4 },
    { id: 'contain', label: 'CNTM CELL', status: 'WATCH', state: 'alert', x: 0.44, y: 0.66, w: 0.17, h: 0.15, load: 58, pulse: 5.5 },
    { id: 'storage', label: 'STORAGE', status: 'DARK SECT', state: 'warn', x: 0.09, y: 0.72, w: 0.16, h: 0.13, load: 49, pulse: 6.6 },
    { id: 'uplink', label: 'UPLINK', status: 'WEAK BUS', state: 'warn', x: 0.79, y: 0.73, w: 0.15, h: 0.12, load: 53, pulse: 7.7 },
    { id: 'service', label: 'SVC BUS', status: 'UNK TRACE', state: 'alert', x: 0.43, y: 0.08, w: 0.16, h: 0.11, load: 47, pulse: 8.8 }
];

const FACILITY_LINKS = [
    { from: 'core', to: 'lab', state: 'ok', phase: 0.05 },
    { from: 'core', to: 'med', state: 'ok', phase: 0.16 },
    { from: 'core', to: 'hab', state: 'warn', phase: 0.27 },
    { from: 'core', to: 'gen', state: 'warn', phase: 0.38 },
    { from: 'core', to: 'contain', state: 'alert', phase: 0.49 },
    { from: 'lab', to: 'service', state: 'warn', phase: 0.6 },
    { from: 'med', to: 'service', state: 'ok', phase: 0.71 },
    { from: 'gen', to: 'storage', state: 'warn', phase: 0.82 },
    { from: 'contain', to: 'uplink', state: 'alert', phase: 0.93 },
    { from: 'hab', to: 'uplink', state: 'warn', phase: 0.35 },
    { from: 'storage', to: 'contain', state: 'warn', phase: 0.58 }
];

const FACILITY_CONTACTS = [
    { from: 'service', to: 'contain', phase: 0.12 },
    { from: 'lab', to: 'core', phase: 0.47 },
    { from: 'storage', to: 'gen', phase: 0.78 }
];

function getFacilityZones() {
    if (facilityZoneCache) return facilityZoneCache;

    const defaultIds = new Set(FACILITY_ZONES.map(zone => zone.id));
    const zones = FACILITY_ZONES
        .filter(zone => statusBool(`facility.zone.${zone.id}.enabled`, true))
        .map(zone => ({
        ...zone,
        label: statusGet(`facility.zone.${zone.id}.label`, zone.label).toUpperCase().slice(0, 12),
        status: statusGet(`facility.zone.${zone.id}.status`, zone.status).toUpperCase().slice(0, 12),
        state: statusState(`facility.zone.${zone.id}.state`, zone.state),
        load: statusNumber(`facility.zone.${zone.id}.load`, zone.load, 0, 100),
        x: statusNumber(`facility.zone.${zone.id}.x`, zone.x, 0.02, 0.92),
        y: statusNumber(`facility.zone.${zone.id}.y`, zone.y, 0.04, 0.86),
        w: statusNumber(`facility.zone.${zone.id}.w`, zone.w, 0.08, 0.28),
        h: statusNumber(`facility.zone.${zone.id}.h`, zone.h, 0.08, 0.24)
    }));

    statusSectionIds('facility.zone')
        .filter(id => !defaultIds.has(id) && statusBool(`facility.zone.${id}.enabled`, true))
        .sort(sortStatusIds)
        .forEach((id, index) => {
            const prefix = `facility.zone.${id}`;
            const fallbackX = 0.16 + (index % 3) * 0.24;
            const fallbackY = 0.18 + Math.floor(index / 3) * 0.18;
            zones.push({
                id,
                label: statusGet(`${prefix}.label`, id.replace(/_/g, ' ')).toUpperCase().slice(0, 12),
                status: statusGet(`${prefix}.status`, 'WATCH').toUpperCase().slice(0, 12),
                state: statusState(`${prefix}.state`, 'warn'),
                load: statusNumber(`${prefix}.load`, 50, 0, 100),
                x: statusNumber(`${prefix}.x`, Math.min(0.84, fallbackX), 0.02, 0.92),
                y: statusNumber(`${prefix}.y`, Math.min(0.78, fallbackY), 0.04, 0.86),
                w: statusNumber(`${prefix}.w`, 0.14, 0.08, 0.28),
                h: statusNumber(`${prefix}.h`, 0.12, 0.08, 0.24),
                pulse: statusNumber(`${prefix}.pulse`, index * 0.43, 0, 10)
            });
        });

    facilityZoneCache = zones;
    return facilityZoneCache;
}

function getFacilityLinks() {
    if (facilityLinkCache) return facilityLinkCache;

    const defaultIds = new Set(FACILITY_LINKS.map(link => `${link.from}_${link.to}`));
    const links = FACILITY_LINKS
        .filter(link => statusBool(`facility.link.${link.from}_${link.to}.enabled`, true))
        .map(link => {
            const id = `${link.from}_${link.to}`;
            return {
                ...link,
                from: normalizeStatusKey(statusGet(`facility.link.${id}.from`, link.from)),
                to: normalizeStatusKey(statusGet(`facility.link.${id}.to`, link.to)),
                state: statusState(`facility.link.${id}.state`, link.state)
            };
        });

    statusSectionIds('facility.link')
        .filter(id => !defaultIds.has(id) && statusBool(`facility.link.${id}.enabled`, true))
        .sort(sortStatusIds)
        .forEach((id, index) => {
            const prefix = `facility.link.${id}`;
            const from = normalizeStatusKey(statusGet(`${prefix}.from`, ''));
            const to = normalizeStatusKey(statusGet(`${prefix}.to`, ''));
            if (!from || !to) return;
            links.push({
                from,
                to,
                state: statusState(`${prefix}.state`, 'warn'),
                phase: statusNumber(`${prefix}.phase`, (index * 0.21 + 0.14) % 1, 0, 1)
            });
        });

    facilityLinkCache = links;
    return facilityLinkCache;
}

function getFacilityContacts() {
    if (facilityContactCache) return facilityContactCache;

    const routeText = statusGet('facility.contacts.routes', '');
    const parsedRoutes = routeText
        ? routeText.split(',').map((route, index) => {
            const parts = route.trim().split(/\s*(?:->|>)\s*/);
            if (parts.length !== 2) return null;
            return {
                from: normalizeStatusKey(parts[0]),
                to: normalizeStatusKey(parts[1]),
                phase: (index * 0.27 + 0.12) % 1
            };
        }).filter(Boolean)
        : [];
    const routes = parsedRoutes.length ? parsedRoutes : FACILITY_CONTACTS;
    const count = Math.round(statusNumber('facility.contacts.unknown', routes.length, 0, 8));
    if (count <= 0) {
        facilityContactCache = [];
        return facilityContactCache;
    }

    const contacts = [];
    for (let i = 0; i < count; i++) {
        const route = routes[i % routes.length] || FACILITY_CONTACTS[i % FACILITY_CONTACTS.length];
        contacts.push({
            ...route,
            phase: (route.phase + i * 0.19) % 1
        });
    }
    facilityContactCache = contacts;
    return facilityContactCache;
}

function facilityZoneReadoutLine(zone) {
    const label = zone.label.padEnd(10, ' ').slice(0, 10);
    const status = zone.status.padEnd(9, ' ').slice(0, 9);
    return `${label} ${status} ${String(Math.round(zone.load)).padStart(2, '0')}%`;
}

function facilityColor(state) {
    if (state === 'alert') return '#ff3333';
    if (state === 'warn') return '#ffb000';
    return '#20c20e';
}

function facilityColorNumber(state) {
    return Number.parseInt(facilityColor(state).slice(1), 16);
}

function facilityViewportSize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    return {
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
        ratio
    };
}

function getPixi() {
    return window.PIXI && window.PIXI.Application && window.PIXI.Graphics ? window.PIXI : null;
}

function resetFacilityPixiState(options = {}) {
    const app = facilityPixiState.app;
    if (app && typeof app.destroy === 'function') {
        try {
            app.destroy(Boolean(options.removeView), { children: true, texture: false, baseTexture: false });
        } catch (error) {}
    }
    facilityPixiState = {
        app: null,
        graphics: null,
        labelContainer: null,
        labels: [],
        canvas: null,
        unavailable: Boolean(options.unavailable)
    };
}

function ensureFacilityPixi(canvas) {
    const PIXI = getPixi();
    if (!PIXI || facilityPixiState.unavailable) return false;
    if (facilityPixiState.app && facilityPixiState.canvas === canvas) return true;

    resetFacilityPixiState();
    try {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        const app = new PIXI.Application({
            view: canvas,
            backgroundAlpha: 0,
            antialias: false,
            autoDensity: true,
            resolution: ratio,
            powerPreference: 'low-power',
            clearBeforeRender: true,
            autoStart: false
        });
        if (app.ticker && typeof app.ticker.stop === 'function') app.ticker.stop();
        const graphics = new PIXI.Graphics();
        const labelContainer = new PIXI.Container();
        app.stage.addChild(graphics, labelContainer);
        facilityPixiState = {
            app,
            graphics,
            labelContainer,
            labels: [],
            canvas,
            unavailable: false
        };
        document.documentElement.classList.add('has-pixi-active');
        return true;
    } catch (error) {
        resetFacilityPixiState({ unavailable: true });
        document.documentElement.classList.remove('has-pixi-active');
        return false;
    }
}

function resizeFacilityPixi(canvas, width, height) {
    const state = facilityPixiState;
    if (!state.app || !state.app.renderer) return false;
    if (facilityCanvasSize.width !== width || facilityCanvasSize.height !== height) {
        state.app.renderer.resize(width, height);
    }
    facilityCanvasSize.width = width;
    facilityCanvasSize.height = height;
    facilityCanvasSize.ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    return true;
}

function drawPixiDashedLine(graphics, x1, y1, x2, y2, dash = 8, gap = 8) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    if (!distance) return;
    const ux = dx / distance;
    const uy = dy / distance;
    let travelled = 0;
    while (travelled < distance) {
        const next = Math.min(distance, travelled + dash);
        graphics.moveTo(x1 + ux * travelled, y1 + uy * travelled);
        graphics.lineTo(x1 + ux * next, y1 + uy * next);
        travelled += dash + gap;
    }
}

function pixiLabel(index, text, x, y, color, size = 11, alpha = 0.9) {
    const PIXI = getPixi();
    if (!PIXI || !facilityPixiState.labelContainer) return;
    let label = facilityPixiState.labels[index];
    if (!label) {
        label = new PIXI.Text('', {
            fontFamily: '"IBM DOS ISO8", "Courier New", monospace',
            fontSize: size,
            fill: color,
            letterSpacing: 0
        });
        label.resolution = Math.min(window.devicePixelRatio || 1, 1.5);
        facilityPixiState.labels[index] = label;
        facilityPixiState.labelContainer.addChild(label);
    }
    label.text = text;
    label.x = x;
    label.y = y;
    label.alpha = alpha;
    label.style.fontSize = size;
    label.style.fill = color;
    label.visible = true;
}

function trimPixiLabels(usedCount) {
    for (let i = usedCount; i < facilityPixiState.labels.length; i++) {
        if (facilityPixiState.labels[i]) facilityPixiState.labels[i].visible = false;
    }
}

function resizeFacilityCanvas(canvas, ctx) {
    const { width, height, ratio } = facilityViewportSize(canvas);
    const targetWidth = Math.max(1, Math.round(width * ratio));
    const targetHeight = Math.max(1, Math.round(height * ratio));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
    }

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    facilityCanvasSize.width = width;
    facilityCanvasSize.height = height;
    facilityCanvasSize.ratio = ratio;
}

function facilityRect(zone, width, height, frame) {
    const drift = prefersReducedMotion ? 0 : Math.sin(frame * 0.042 + zone.pulse) * 1.2;
    const rect = {
        x: Math.round(zone.x * width + drift),
        y: Math.round(zone.y * height - drift * 0.45),
        w: Math.max(52, Math.round(zone.w * width)),
        h: Math.max(38, Math.round(zone.h * height))
    };
    rect.cx = rect.x + rect.w * 0.5;
    rect.cy = rect.y + rect.h * 0.5;
    return rect;
}

function drawFacilityBackdrop(ctx, width, height, frame) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 8, 4, 0.56)';
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.48;
    ctx.save();
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.08;
    for (let radius = 70; radius < Math.max(width, height); radius += 86) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    if (!prefersReducedMotion) {
        const sweepX = ((frame * 3.4) % (width + 160)) - 80;
        const sweep = ctx.createLinearGradient(sweepX - 42, 0, sweepX + 42, 0);
        sweep.addColorStop(0, 'rgba(0,212,170,0)');
        sweep.addColorStop(0.5, 'rgba(0,212,170,0.12)');
        sweep.addColorStop(1, 'rgba(0,212,170,0)');
        ctx.fillStyle = sweep;
        ctx.fillRect(sweepX - 42, 0, 84, height);
    }
    ctx.restore();
}

function drawFacilityConnection(ctx, link, rects, frame) {
    const start = rects[link.from];
    const end = rects[link.to];
    if (!start || !end) return;

    const color = facilityColor(link.state);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = link.state === 'alert' ? 0.46 : 0.32;
    ctx.lineWidth = link.state === 'alert' ? 1.2 : 1;
    ctx.setLineDash(link.state === 'ok' ? [9, 11] : [5, 8]);
    ctx.lineDashOffset = prefersReducedMotion ? 0 : -frame * (link.state === 'alert' ? 1.3 : 0.75);
    ctx.beginPath();
    ctx.moveTo(start.cx, start.cy);
    ctx.lineTo(end.cx, end.cy);
    ctx.stroke();

    const t = prefersReducedMotion ? link.phase : (frame * 0.012 + link.phase) % 1;
    const px = start.cx + (end.cx - start.cx) * t;
    const py = start.cy + (end.cy - start.cy) * t;
    ctx.setLineDash([]);
    ctx.globalAlpha = link.state === 'alert' ? 0.95 : 0.72;
    ctx.fillStyle = color;
    ctx.fillRect(px - 2, py - 2, 4, 4);
    ctx.restore();
}

function drawFacilityBlock(ctx, zone, rect, frame, width) {
    const color = facilityColor(zone.state);
    const blink = zone.state === 'alert' && !prefersReducedMotion && frame % 24 < 12;
    const offset = Math.max(5, Math.min(10, rect.w * 0.09));
    const labelSize = width < 560 ? 10 : 12;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = zone.state === 'alert' ? 1.35 : 1;
    ctx.globalAlpha = blink ? 0.55 : 0.84;
    ctx.shadowColor = color;
    ctx.shadowBlur = 3;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha *= 0.52;
    ctx.strokeRect(rect.x + offset, rect.y - offset, rect.w, rect.h);
    ctx.beginPath();
    ctx.moveTo(rect.x, rect.y);
    ctx.lineTo(rect.x + offset, rect.y - offset);
    ctx.moveTo(rect.x + rect.w, rect.y);
    ctx.lineTo(rect.x + rect.w + offset, rect.y - offset);
    ctx.moveTo(rect.x, rect.y + rect.h);
    ctx.lineTo(rect.x + offset, rect.y + rect.h - offset);
    ctx.moveTo(rect.x + rect.w, rect.y + rect.h);
    ctx.lineTo(rect.x + rect.w + offset, rect.y + rect.h - offset);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 0.92;
    ctx.font = `${labelSize}px "IBM DOS ISO8", "Courier New", monospace`;
    ctx.fillText(zone.label, rect.x + 7, rect.y + 16);
    ctx.globalAlpha = zone.state === 'ok' ? 0.62 : 0.86;
    ctx.fillText(zone.status, rect.x + 7, rect.y + Math.min(rect.h - 8, 32));

    const barWidth = Math.max(28, rect.w - 14);
    const barY = rect.y + rect.h - 9;
    ctx.globalAlpha = 0.24;
    ctx.fillRect(rect.x + 7, barY, barWidth, 3);
    ctx.globalAlpha = blink ? 0.62 : 0.75;
    ctx.fillRect(rect.x + 7, barY, barWidth * Math.max(0.08, zone.load / 100), 3);
    ctx.restore();
}

function drawFacilityContacts(ctx, rects, frame, contacts) {
    ctx.save();
    ctx.strokeStyle = '#ff3333';
    ctx.fillStyle = '#ff3333';
    ctx.lineWidth = 1;
    contacts.forEach((contact, index) => {
        const start = rects[contact.from];
        const end = rects[contact.to];
        if (!start || !end) return;
        const t = prefersReducedMotion ? contact.phase : (contact.phase + frame * (0.006 + index * 0.001)) % 1;
        const wobble = prefersReducedMotion ? 0 : Math.sin(frame * 0.09 + index) * 7;
        const px = start.cx + (end.cx - start.cx) * t;
        const py = start.cy + (end.cy - start.cy) * t + wobble;
        const radius = 4 + (prefersReducedMotion ? 0 : Math.sin(frame * 0.18 + index) * 1.2);
        ctx.globalAlpha = 0.38;
        ctx.beginPath();
        ctx.arc(px, py, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function renderFacilityStatusPixi(canvas, width, height, frame, zones, links, contacts, rects) {
    try {
        if (!ensureFacilityPixi(canvas)) return false;
        if (!resizeFacilityPixi(canvas, width, height)) return false;

        const state = facilityPixiState;
        const graphics = state.graphics;
        if (!graphics || !state.app || !state.app.renderer) return false;

        graphics.clear();
    graphics.beginFill(0x000804, 0.56);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    const cx = width * 0.5;
    const cy = height * 0.48;
    graphics.lineStyle(1, 0x00d4aa, 0.08);
    for (let radius = 70; radius < Math.max(width, height); radius += 86) {
        graphics.drawEllipse(cx, cy, radius, radius * 0.38);
    }
    graphics.lineStyle(1, 0x00d4aa, 0.1);
    graphics.moveTo(0, cy);
    graphics.lineTo(width, cy);
    graphics.moveTo(cx, 0);
    graphics.lineTo(cx, height);

    if (!prefersReducedMotion) {
        const sweepX = ((frame * 3.4) % (width + 160)) - 80;
        graphics.beginFill(0x00d4aa, 0.055);
        graphics.drawRect(sweepX - 18, 0, 36, height);
        graphics.endFill();
    }

    links.forEach(link => {
        const start = rects[link.from];
        const end = rects[link.to];
        if (!start || !end) return;
        const color = facilityColorNumber(link.state);
        graphics.lineStyle(link.state === 'alert' ? 1.2 : 1, color, link.state === 'alert' ? 0.46 : 0.32);
        drawPixiDashedLine(graphics, start.cx, start.cy, end.cx, end.cy, link.state === 'ok' ? 9 : 5, link.state === 'ok' ? 11 : 8);
        const t = prefersReducedMotion ? link.phase : (frame * 0.012 + link.phase) % 1;
        const px = start.cx + (end.cx - start.cx) * t;
        const py = start.cy + (end.cy - start.cy) * t;
        graphics.beginFill(color, link.state === 'alert' ? 0.95 : 0.72);
        graphics.drawRect(px - 2, py - 2, 4, 4);
        graphics.endFill();
    });

    let labelIndex = 0;
    zones.forEach(zone => {
        const rect = rects[zone.id];
        if (!rect) return;
        const color = facilityColorNumber(zone.state);
        const colorText = facilityColor(zone.state);
        const blink = zone.state === 'alert' && !prefersReducedMotion && frame % 24 < 12;
        const offset = Math.max(5, Math.min(10, rect.w * 0.09));
        const labelSize = width < 560 ? 10 : 12;

        graphics.lineStyle(zone.state === 'alert' ? 1.35 : 1, color, blink ? 0.55 : 0.84);
        graphics.drawRect(rect.x, rect.y, rect.w, rect.h);
        graphics.lineStyle(zone.state === 'alert' ? 1.35 : 1, color, blink ? 0.28 : 0.44);
        graphics.drawRect(rect.x + offset, rect.y - offset, rect.w, rect.h);
        graphics.moveTo(rect.x, rect.y);
        graphics.lineTo(rect.x + offset, rect.y - offset);
        graphics.moveTo(rect.x + rect.w, rect.y);
        graphics.lineTo(rect.x + rect.w + offset, rect.y - offset);
        graphics.moveTo(rect.x, rect.y + rect.h);
        graphics.lineTo(rect.x + offset, rect.y + rect.h - offset);
        graphics.moveTo(rect.x + rect.w, rect.y + rect.h);
        graphics.lineTo(rect.x + rect.w + offset, rect.y + rect.h - offset);

        graphics.beginFill(color, 0.24);
        graphics.drawRect(rect.x + 7, rect.y + rect.h - 9, Math.max(28, rect.w - 14), 3);
        graphics.endFill();
        graphics.beginFill(color, blink ? 0.62 : 0.75);
        graphics.drawRect(rect.x + 7, rect.y + rect.h - 9, Math.max(28, rect.w - 14) * Math.max(0.08, zone.load / 100), 3);
        graphics.endFill();

        pixiLabel(labelIndex++, zone.label, rect.x + 7, rect.y + 5, colorText, labelSize, 0.92);
        pixiLabel(labelIndex++, zone.status, rect.x + 7, rect.y + Math.min(rect.h - 19, 21), colorText, labelSize, zone.state === 'ok' ? 0.62 : 0.86);
    });

    graphics.lineStyle(1, 0xff3333, 1);
    contacts.forEach((contact, index) => {
        const start = rects[contact.from];
        const end = rects[contact.to];
        if (!start || !end) return;
        const t = prefersReducedMotion ? contact.phase : (contact.phase + frame * (0.006 + index * 0.001)) % 1;
        const wobble = prefersReducedMotion ? 0 : Math.sin(frame * 0.09 + index) * 7;
        const px = start.cx + (end.cx - start.cx) * t;
        const py = start.cy + (end.cy - start.cy) * t + wobble;
        const radius = 4 + (prefersReducedMotion ? 0 : Math.sin(frame * 0.18 + index) * 1.2);
        graphics.lineStyle(1, 0xff3333, 0.38);
        graphics.drawCircle(px, py, radius + 4);
        graphics.beginFill(0xff3333, 0.95);
        graphics.drawCircle(px, py, Math.max(2, radius * 0.45));
        graphics.endFill();
    });
    trimPixiLabels(labelIndex);

        state.app.renderer.render(state.app.stage);
        return true;
    } catch (error) {
        resetFacilityPixiState({ unavailable: true });
        document.documentElement.classList.remove('has-pixi-active');
        return false;
    }
}

function updateFacilityReadouts(frame) {
    const loading = !prefersReducedMotion && frame < 10;
    const phase = prefersReducedMotion ? 24 : frame;
    const zones = getFacilityZones();
    const structure = statusNumber('facility.grid.structure', 77 + Math.round(Math.sin(phase * 0.08) * 2), 0, 100);
    const power = statusNumber('facility.grid.power', 61 + Math.round(Math.sin(phase * 0.1) * 3), 0, 100);
    const reserve = statusNumber('facility.grid.reserve', 34 + Math.round(Math.cos(phase * 0.09) * 4), 0, 100);
    const known = Math.round(statusNumber('facility.contacts.known', 14, 0, 99));
    const unknown = Math.round(statusNumber('facility.contacts.unknown', 3 + (phase % 29 === 0 ? 1 : 0), 0, 99));

    if (loading) {
        diagText('facilityMeta', `WIREFRAME BUS: ALIGNING ${asciiBar(Math.min(99, 14 + frame * 9), 10)}`);
        diagText('facilityScanStatus', `INDEX ${spinner(frame)} ${asciiSweep(frame, 14)}`);
        diagText('facilityOverview', statusBlock('facility.overview', [
            '> LOADING FACILITY GRID',
            `  VECTOR BUS ${asciiBar(20 + frame * 7, 12)}`,
            `  TRACE      ${asciiSweep(frame, 16)}`,
            '  STATUS     WAITING'
        ], phase));
        diagText('facilityZones', statusBlock('facility.zones', [
            'CMD CORE    : SCAN',
            'LAB ARC     : SCAN',
            'GEN PLANT   : SCAN',
            'CNTM CELL   : SCAN'
        ], phase));
        diagText('facilityContacts', statusBlock('facility.contact_readout', [
            'BIO GRID    : SYNC',
            'FAULT BUS   : SYNC',
            `TRACE       : ${asciiGraph(frame, 16)}`,
            'UNKNOWN     : HOLD'
        ], phase));
        diagText('facilityTicker', `FACILITY WIREFRAME HANDSHAKE ${spinner(frame)} ${asciiSweep(frame, 18)}`);
        return;
    }

    diagText('facilityMeta', `WIREFRAME BUS: LIVE // FRAME ${String(frame).padStart(4, '0')}`);
    diagText('facilityScanStatus', `SWEEP ${String((phase * 7) % 100).padStart(2, '0')}%`);
    diagText('facilityOverview', statusBlock('facility.overview', [
        `GRID ID     : ${statusGet('facility.grid.id', 'BDR-01')}`,
        `STRUCTURE   : ${asciiBar(structure, 12)}`,
        `POWER BUS   : ${asciiBar(power, 12)}`,
        `RESERVE     : ${asciiBar(reserve, 12)}`,
        `REPAIR IDX  : ${statusGet('facility.grid.repair', '06 OPEN')}`
    ], phase));
    diagText('facilityZones', statusBlock('facility.zones', zones
        .filter(zone => ['core', 'lab', 'gen', 'hab', 'contain', 'service'].includes(zone.id))
        .map(facilityZoneReadoutLine), phase));
    diagText('facilityContacts', statusBlock('facility.contact_readout', [
        `KNOWN BIO   : ${String(known).padStart(2, '0')}`,
        `UNKNOWN BIO : ${String(unknown).padStart(2, '0')} MOVING`,
        `CAM GRID    : ${statusGet('facility.contacts.camera', '05/12 DIRTY')}`,
        `FAULTS      : ${statusGet('facility.contacts.faults', 'PUMP2 DOOR-C RLY04')}`,
        `TRACE       : ${asciiSweep(phase, 16)}`
    ], phase));
    const defaultTicker = `MAINTENANCE REQUIRED // ABSTRACT GRID ONLY // UNKNOWN LIFE SIGNS DETECTED ${spinner(phase)}`;
    diagText('facilityTicker', statusInterpolate(statusGet('facility.ticker', defaultTicker), phase));
}

function renderFacilityStatus(timestamp = 0) {
    const canvas = getById('facilityCanvas');
    if (!canvas) return;
    const { width, height } = facilityViewportSize(canvas);
    const frame = facilityFrame || Math.round(timestamp / 33);
    const rects = {};
    const zones = getFacilityZones();
    const links = getFacilityLinks();
    const contacts = getFacilityContacts();

    zones.forEach(zone => {
        rects[zone.id] = facilityRect(zone, width, height, frame);
    });

    if (renderFacilityStatusPixi(canvas, width, height, frame, zones, links, contacts, rects)) {
        if (frame < 3 || frame % 4 === 0 || prefersReducedMotion) {
            updateFacilityReadouts(frame);
        }
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        if (frame < 3 || frame % 4 === 0 || prefersReducedMotion) {
            updateFacilityReadouts(frame);
        }
        return;
    }

    resizeFacilityCanvas(canvas, ctx);
    drawFacilityBackdrop(ctx, width, height, frame);
    links.forEach(link => drawFacilityConnection(ctx, link, rects, frame));
    zones.forEach(zone => drawFacilityBlock(ctx, zone, rects[zone.id], frame, width));
    drawFacilityContacts(ctx, rects, frame, contacts);

    if (frame < 3 || frame % 4 === 0 || prefersReducedMotion) {
        updateFacilityReadouts(frame);
    }
}

function runFacilityLoop(timestamp = 0) {
    if (!facilityActive) return;
    const interval = 34;
    if (!facilityLastRender || timestamp - facilityLastRender >= interval) {
        facilityLastRender = timestamp;
        facilityFrame++;
        renderFacilityStatus(timestamp);
        if (facilityFrame < 12 && facilityFrame % 3 === 0) AudioEngine.keyClick();
    }
    facilityAnimFrame = requestAnimationFrame(runFacilityLoop);
}

function showFacilityStatus() {
    const overlay = document.getElementById('facilityOverlay');
    if (!overlay || overlay.classList.contains('active')) return;
    facilityActive = true;
    facilityFrame = prefersReducedMotion ? 24 : 0;
    facilityLastRender = 0;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    renderFacilityStatus(performance.now());
    AudioEngine.bootBeep();
    Animator.dialogOpen(overlay);
    if (!prefersReducedMotion) {
        facilityAnimFrame = requestAnimationFrame(runFacilityLoop);
    }
}

function closeFacilityStatus() {
    const overlay = document.getElementById('facilityOverlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    facilityActive = false;
    if (facilityAnimFrame) {
        cancelAnimationFrame(facilityAnimFrame);
        facilityAnimFrame = null;
    }
    AudioEngine.pageFlip();
    Animator.dialogClose(overlay, () => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    });
}

// ========================================
// ACCESS CONTROL
// ========================================
function showAccessDialog() {
    if (adminMode) {
        print('');
        print('Administrator access already granted.', 't-dim');
        print('');
        return;
    }
    
    const dialog = document.getElementById('accessDialog');
    const input = document.getElementById('accessPassword');
    const error = document.getElementById('accessError');
    
    accessDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.classList.add('active');
    dialog.setAttribute('aria-hidden', 'false');
    error.classList.remove('visible');
    input.value = '';
    Animator.dialogOpen(dialog);
    input.focus();
}

function closeAccessDialog() {
    const dialog = document.getElementById('accessDialog');
    if (!dialog.classList.contains('active')) return;
    Animator.dialogClose(dialog, () => {
        dialog.classList.remove('active');
        dialog.setAttribute('aria-hidden', 'true');
        if (accessDialogReturnFocus && accessDialogReturnFocus.isConnected) {
            accessDialogReturnFocus.focus();
        }
        accessDialogReturnFocus = null;
    });
}

function submitAccessPassword() {
    const input = document.getElementById('accessPassword');
    const error = document.getElementById('accessError');
    const password = input.value;
    
    if (password === ADMIN_PASSWORD) {
        closeAccessDialog();
        grantAdminAccess();
    } else {
        AudioEngine.errorBuzz();
        error.classList.add('visible');
        Animator.alertShake(document.querySelector('#accessDialog .dialog-box'));
        input.value = '';
        input.focus();
    }
}

function grantAdminAccess() {
    setAdminAccessState(true);
    AudioEngine.accessGranted();
    Animator.adminAccess();
    
    clearOutput();
    print('');
    print('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', 't-red');
    const grantedText = contentGet('admin.access_granted', 'ADMINISTRATOR ACCESS GRANTED').toUpperCase();
    print(`▓     ${grantedText.padEnd(35, ' ').slice(0, 35)}▓`, 't-red');
    print('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', 't-red');
    print('');
    print('Additional commands unlocked:', 't-amber');
    print('  • LOAD STATUS - Import facility status profile');
    print('  • LIST ALL - View complete database');
    print('  • FUZZY SEARCH - Partial match search');
    print('  • LOGOUT - End admin session');
    print('');
    print('CONFIDENTIAL entries are now accessible.', 't-magenta');
    print('');
}

function setAdminAccessState(enabled, options = {}) {
    adminMode = Boolean(enabled);
    const badge = document.getElementById('adminBadge');
    if (badge) badge.classList.toggle('active', adminMode);

    document.querySelectorAll('.menu-item.admin-cmd').forEach(item => {
        item.classList.toggle('locked', !adminMode);
        item.setAttribute('aria-disabled', adminMode ? 'false' : 'true');
    });

    if (!adminMode && options.resetSelection !== false && menuItems[selectedMenuIndex]?.classList.contains('locked')) {
        selectedMenuIndex = 0;
        updateMenuSelection();
    }
}

function logout() {
    setAdminAccessState(false);
    AudioEngine.errorBuzz();
    
    clearOutput();
    print('');
    print(contentGet('admin.logout', 'Administrator session terminated.'), 't-red');
    print('Elevated privileges revoked.', 't-dim');
    print('');
}

function forceCloseRuntimeOverlays() {
    closeLiebiGame();

    const accessDialog = document.getElementById('accessDialog');
    if (accessDialog) {
        accessDialog.classList.remove('active');
        accessDialog.setAttribute('aria-hidden', 'true');
    }
    accessDialogReturnFocus = null;

    const diagnosticOverlay = document.getElementById('diagnosticOverlay');
    diagnosticActive = false;
    if (diagnosticAnimFrame) {
        cancelAnimationFrame(diagnosticAnimFrame);
        diagnosticAnimFrame = null;
    }
    if (diagnosticOverlay) {
        diagnosticOverlay.classList.remove('active');
        diagnosticOverlay.setAttribute('aria-hidden', 'true');
    }

    const facilityOverlay = document.getElementById('facilityOverlay');
    facilityActive = false;
    if (facilityAnimFrame) {
        cancelAnimationFrame(facilityAnimFrame);
        facilityAnimFrame = null;
    }
    if (facilityOverlay) {
        facilityOverlay.classList.remove('active');
        facilityOverlay.setAttribute('aria-hidden', 'true');
    }
}

function restartTerminalAfterStatusLoad() {
    forceCloseRuntimeOverlays();
    setAdminAccessState(false, { resetSelection: false });
    selectedMenuIndex = 0;
    renderedMenuIndex = -1;
    updateMenuSelection();
    menuFocused = true;

    if (terminalKeyHandlerBound) {
        document.removeEventListener('keydown', handleGlobalKeydown);
        terminalKeyHandlerBound = false;
    }

    clearOutput();
    const commandInput = document.getElementById('commandInput');
    if (commandInput) {
        commandInput.value = '';
        commandInput.blur();
    }
    const terminal = document.querySelector('.screen-content');
    if (terminal) {
        terminal.style.opacity = '0';
        terminal.style.transform = 'scale(0.995)';
    }

    const gsap = Animator.getGsap();
    if (gsap) gsap.killTweensOf(['#bootScreen', '.screen-content', '.boot-left', '#bootOutput', '.boot-skip']);
    document.body.classList.remove('terminal-ready');
    startBootSequence();
}

// ========================================
// FILE HANDLING
// ========================================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) {
        pendingLocalDatabaseItem = null;
        return;
    }

    if (databaseCapacityFull()) {
        pendingLocalDatabaseItem = null;
        printDatabaseSlotsFull();
        e.target.value = '';
        return;
    }
    
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown') || fileName.endsWith('.txt')) {
        loadPlainDatabaseFile(file);
    } else if (fileName.endsWith('.dat') || fileName.endsWith('.db') || fileName.endsWith('.bin')) {
        loadEncryptedFile(file);
    } else {
        AudioEngine.errorBuzz();
        print('');
        print('ERROR: Unsupported file format.', 't-red');
        print('Expected: .md, .txt, or encrypted database (.dat)', 't-dim');
        print('');
    }
    e.target.value = '';
}

function loadPlainDatabaseFile(file) {
    print('');
    print('LOCAL DATABASE FILE DETECTED', 't-amber');
    print(`Reading: ${file.name}`, 't-dim');

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const content = String(event.target.result || '');
            const markdownDatabase = parseMarkdownDatabase(content, file.name);
            if (markdownDatabase.entries.length) {
                promptForParsedDatabase(markdownDatabase, pendingLocalDatabaseItem || { file: file.name, displayName: file.name }, file.name);
                pendingLocalDatabaseItem = null;
                return;
            }

            const legacyDatabase = parseLegacyDatabase(content, file.name);
            if (!legacyDatabase.entries.length) throw new Error('No entries found');
            mountParsedDatabase(legacyDatabase, pendingLocalDatabaseItem || { file: file.name, displayName: file.name }, file.name);
            pendingLocalDatabaseItem = null;
        } catch (error) {
            pendingLocalDatabaseItem = null;
            AudioEngine.errorBuzz();
            print('');
            print('ERROR: DATABASE LOAD FAILED', 't-red');
            print('No readable Markdown or legacy entries were found.', 't-dim');
            print('');
        }
    };
    reader.onerror = function() {
        pendingLocalDatabaseItem = null;
        AudioEngine.errorBuzz();
        print('');
        print('ERROR: Could not read file.', 't-red');
        print('');
    };
    reader.readAsText(file);
}

function decodeEncryptedPayload(encoded) {
    const raw = atob(String(encoded || '').trim());
    const legacyPlaintext = xorCrypt(raw);
    let utf8Plaintext = '';

    try {
        const utf8Encrypted = decodeURIComponent(escape(raw));
        utf8Plaintext = xorCrypt(utf8Encrypted);
    } catch (error) {}

    return {
        legacyPlaintext,
        utf8Plaintext,
        preferred: utf8Plaintext || legacyPlaintext
    };
}

function decodeDatabasePayload(encoded) {
    const decoded = decodeEncryptedPayload(encoded);
    if (decoded.legacyPlaintext.includes(':') && decoded.legacyPlaintext.includes('|')) return decoded.legacyPlaintext;
    if (decoded.utf8Plaintext.includes(':') && decoded.utf8Plaintext.includes('|')) return decoded.utf8Plaintext;
    if (parseMarkdownDatabase(decoded.utf8Plaintext).entries.length) return decoded.utf8Plaintext;
    if (parseMarkdownDatabase(decoded.legacyPlaintext).entries.length) return decoded.legacyPlaintext;
    return decoded.preferred;
}

function decodeStatusPayload(encoded) {
    const decoded = decodeEncryptedPayload(encoded);
    const candidates = [decoded.utf8Plaintext, decoded.legacyPlaintext].filter(Boolean);
    return candidates.find(content => parseStatusProfile(content).loaded) || decoded.preferred;
}

function handleStatusFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.markdown') || fileName.endsWith('.dat') || fileName.endsWith('.db') || fileName.endsWith('.bin')) {
        loadStatusProfileFile(file);
    } else {
        AudioEngine.errorBuzz();
        print('');
        print('ERROR: Unsupported status profile format.', 't-red');
        print('Expected: .txt, .md, .markdown, or encrypted .dat', 't-dim');
        print('');
    }
    e.target.value = '';
}

async function fetchTextFile(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path} HTTP ${response.status}`);
    return response.text();
}

async function loadDatabaseManifest() {
    if (databaseManifest) return databaseManifest;
    try {
        const response = await fetch('databases/manifest.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const manifest = await response.json();
        if (!manifest || !Array.isArray(manifest.databases)) throw new Error('Invalid manifest');
        databaseManifestSource = 'manifest';
        databaseManifest = manifest.databases;
    } catch (error) {
        databaseManifestSource = 'fallback';
        databaseManifest = FALLBACK_DATABASE_MANIFEST.map(item => ({ ...item, fallback: true }));
    }
    return databaseManifest;
}

function closeDatabaseModal() {
    clearDatabaseDecryptAnimation();
    const modal = getById('databaseModal');
    if (modal) modal.remove();
    activeDatabaseSelection = null;
    pendingLocalDatabaseItem = null;
}

function clearDatabaseDecryptAnimation() {
    if (databaseDecryptFrame) {
        cancelAnimationFrame(databaseDecryptFrame);
        databaseDecryptFrame = null;
    }
}

function createDatabaseModal(titleText) {
    closeDatabaseModal();
    const overlay = document.createElement('div');
    overlay.className = 'database-modal-overlay';
    overlay.id = 'databaseModal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'databaseModalTitle');

    const panel = document.createElement('div');
    panel.className = 'database-modal-panel glow';

    const header = document.createElement('div');
    header.className = 'database-modal-header';
    const title = document.createElement('div');
    title.className = 'database-modal-title';
    title.id = 'databaseModalTitle';
    title.textContent = titleText;
    const close = document.createElement('button');
    close.className = 'database-modal-close';
    close.type = 'button';
    close.textContent = '[ CLOSE ]';
    close.addEventListener('click', closeDatabaseModal);
    header.append(title, close);

    const body = document.createElement('div');
    body.className = 'database-modal-body';
    body.id = 'databaseModalBody';

    panel.append(header, body);
    overlay.appendChild(panel);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) closeDatabaseModal();
    });
    document.body.appendChild(overlay);
    close.focus();
    return { overlay, body };
}

function ensureDatabaseModal(titleText = 'LOAD DATABASE') {
    const existingBody = getById('databaseModalBody');
    if (existingBody) return existingBody;
    return createDatabaseModal(titleText).body;
}

function renderDatabaseSelectorList(body, manifest) {
    body.textContent = '';
    const intro = document.createElement('p');
    intro.className = 'database-modal-copy';
    intro.textContent = 'Select a database package.';
    body.appendChild(intro);

    if (databaseManifestSource === 'fallback') {
        const warning = document.createElement('p');
        warning.className = 'database-modal-copy t-amber';
        warning.textContent = 'Manifest fetch is blocked or unavailable. Showing the default database list. If you opened index.html directly, the next step may ask you to select the matching local .md file manually.';
        body.appendChild(warning);
    }

    const list = document.createElement('div');
    list.className = 'database-list';
    manifest.forEach(item => {
        const alreadyMounted = databaseItemAlreadyMounted(item);
        const button = document.createElement('button');
        button.className = `database-choice ${alreadyMounted ? 'disabled mounted' : ''}`.trim();
        button.type = 'button';
        button.disabled = alreadyMounted;
        if (alreadyMounted) button.setAttribute('aria-disabled', 'true');
        const name = document.createElement('span');
        name.className = 'database-choice-name';
        name.textContent = item.displayName || item.name || item.file;
        const description = document.createElement('span');
        description.className = 'database-choice-description';
        description.textContent = alreadyMounted
            ? 'DATABASE ALREADY LOADED - eject its slot to load it again.'
            : (item.description || item.file);
        button.append(name, description);
        if (!alreadyMounted) button.addEventListener('click', () => prepareManifestDatabase(item));
        list.appendChild(button);
    });
    body.appendChild(list);

    const external = document.createElement('button');
    external.className = 'database-choice database-choice-external';
    external.type = 'button';
    const externalName = document.createElement('span');
    externalName.className = 'database-choice-name';
    externalName.textContent = 'ADD EXTERNAL DATABASE FILE';
    const externalDescription = document.createElement('span');
    externalDescription.className = 'database-choice-description';
    externalDescription.textContent = 'Open local file picker for .md, .txt, or encrypted .dat database packages.';
    external.append(externalName, externalDescription);
    external.addEventListener('click', () => {
        if (databaseCapacityFull()) {
            renderDatabaseSlotsFullPrompt(body);
            return;
        }
        pendingLocalDatabaseItem = { file: 'external database', displayName: 'External Database' };
        document.getElementById('fileInput').click();
    });
    body.appendChild(external);
}

async function showDatabaseSelector() {
    const { body } = createDatabaseModal('LOAD DATABASE');
    if (databaseCapacityFull()) {
        renderDatabaseSlotsFullPrompt(body);
        return;
    }
    body.textContent = 'Reading database manifest...';

    const manifest = await loadDatabaseManifest();
    renderDatabaseSelectorList(body, manifest);
}

async function prepareManifestDatabase(item) {
    const modal = getById('databaseModal');
    const body = getById('databaseModalBody');
    if (!modal || !body) return;
    if (databaseItemAlreadyMounted(item)) {
        renderDatabaseAlreadyMountedPrompt(body, item);
        return;
    }
    if (databaseCapacityFull()) {
        renderDatabaseSlotsFullPrompt(body);
        return;
    }
    body.textContent = 'Fetching database package...';
    try {
        const path = `databases/${item.file || item.filename}`;
        const content = await fetchTextFile(path);
        const parsed = parseMarkdownDatabase(content, item.displayName || item.name || item.file);
        if (!parsed.entries.length) throw new Error('No entries found');
        promptForParsedDatabase(parsed, item, path);
    } catch (error) {
        renderLocalDatabasePrompt(item);
        AudioEngine.errorBuzz();
    }
}

function promptForParsedDatabase(parsed, item = {}, path = '') {
    ensureDatabaseModal('LOAD DATABASE');
    if (databaseAlreadyMountedByIdentities(parsedDatabaseIdentities(parsed, item, path))) {
        renderDatabaseAlreadyMountedPrompt(getById('databaseModalBody'), item, parsed);
        return;
    }
    if (databaseCapacityFull()) {
        renderDatabaseSlotsFullPrompt(getById('databaseModalBody'));
        return;
    }
    activeDatabaseSelection = { item, parsed, path };
    renderDatabasePasswordPrompt(parsed);
}

function renderDatabaseAlreadyMountedPrompt(body, item = {}, parsed = {}) {
    if (!body) return;
    body.textContent = '';
    const name = parsed.metadata?.title || item.displayName || item.name || item.file || 'Selected database';
    const message = document.createElement('p');
    message.className = 'database-modal-copy t-amber';
    message.textContent = `${name} is already mounted. Eject that database slot before loading it again.`;
    const back = document.createElement('button');
    back.className = 'database-modal-action secondary';
    back.type = 'button';
    back.textContent = 'BACK TO DATABASE LIST';
    back.addEventListener('click', showDatabaseSelector);
    body.append(message, back);
    back.focus();
}

function renderDatabaseSlotsFullPrompt(body) {
    if (!body) return;
    body.textContent = '';
    const message = document.createElement('p');
    message.className = 'database-modal-copy t-red';
    message.textContent = 'DATABASE SLOT CAPACITY REACHED. Eject one database package before loading another.';
    const details = document.createElement('pre');
    details.className = 'database-slot-details';
    details.textContent = databaseSlots.map(slot => (
        `SLOT ${slot.index + 1}: ${slot.loaded ? databaseSlotDisplayName(slot) : 'EMPTY'}`
    )).join('\n');
    const actions = document.createElement('div');
    actions.className = 'database-modal-actions';
    const abort = document.createElement('button');
    abort.className = 'database-modal-action secondary';
    abort.type = 'button';
    abort.textContent = 'ABORT';
    abort.addEventListener('click', closeDatabaseModal);
    actions.appendChild(abort);
    databaseSlots.forEach(slot => {
        const eject = document.createElement('button');
        eject.className = 'database-modal-action';
        eject.type = 'button';
        eject.textContent = `EJECT SLOT ${slot.index + 1}`;
        eject.disabled = !slot.loaded;
        eject.addEventListener('click', () => {
            ejectDatabaseSlot(slot.index);
            closeDatabaseModal();
        });
        actions.appendChild(eject);
    });
    body.append(message, details, actions);
    abort.focus();
}

function renderLocalDatabasePrompt(item = {}) {
    const body = ensureDatabaseModal('LOAD DATABASE');
    body.textContent = '';
    const fileName = item.file || item.filename || 'database.md';
    const message = document.createElement('p');
    message.className = 'database-modal-copy t-amber';
        message.textContent = `${contentGet('errors.database_package_fail', 'DATABASE PACKAGE FAILED TO LOAD.')} The browser could not fetch databases/${fileName}. On GitHub Pages, make sure the root .nojekyll file is uploaded so Markdown databases are served as raw files. If you opened the page directly from disk, select that file manually from the databases folder.`;
    const select = document.createElement('button');
    select.className = 'database-modal-action';
    select.type = 'button';
    select.textContent = `SELECT ${fileName.toUpperCase()}`;
    select.addEventListener('click', () => {
        pendingLocalDatabaseItem = item;
        document.getElementById('fileInput').click();
    });
    const back = document.createElement('button');
    back.className = 'database-modal-action secondary';
    back.type = 'button';
    back.textContent = 'BACK TO DATABASE LIST';
    back.addEventListener('click', showDatabaseSelector);
    const actions = document.createElement('div');
    actions.className = 'database-modal-actions';
    actions.append(select, back);
    body.append(message, actions);
}

function renderDatabasePasswordPrompt(parsed, previousError = '') {
    clearDatabaseDecryptAnimation();
    const body = getById('databaseModalBody');
    if (!body) return;
    body.textContent = '';
    const title = document.createElement('p');
    title.className = 'database-modal-copy';
    title.textContent = `Selected: ${parsed.metadata.title || parsed.source}`;
    const description = document.createElement('p');
    description.className = 'database-modal-copy t-dim';
    description.textContent = parsed.metadata.description || 'Enter package clearance password.';
    const input = document.createElement('input');
    input.className = 'database-password-input';
    input.type = 'password';
    input.placeholder = 'Database password...';
    input.setAttribute('aria-label', 'Database password');
    const error = document.createElement('div');
    error.className = 'database-password-error';
    error.textContent = previousError;
    const actions = document.createElement('div');
    actions.className = 'database-modal-actions';
    const submit = document.createElement('button');
    submit.className = 'database-modal-action';
    submit.type = 'button';
    submit.textContent = 'AUTHENTICATE';
    submit.dataset.authenticateDatabase = 'true';
    const back = document.createElement('button');
    back.className = 'database-modal-action secondary';
    back.type = 'button';
    back.textContent = 'BACK';
    actions.append(submit, back);
    body.append(title, description, input, error, actions);

    let authenticationRunning = false;
    const authenticate = () => {
        if (authenticationRunning) return;
        authenticationRunning = true;
        const submittedPassword = input.value.trim();
        const expected = String(parsed.metadata.password || '').trim();
        runDatabaseDecryptionAnimation(parsed, submittedPassword === expected);
    };
    submit.addEventListener('click', authenticate);
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            authenticate();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeDatabaseModal();
        }
    });
    back.addEventListener('click', showDatabaseSelector);
    input.focus();
}

function runDatabaseDecryptionAnimation(parsed, passwordMatches) {
    clearDatabaseDecryptAnimation();
    const body = getById('databaseModalBody');
    if (!body) return;

    body.textContent = '';
    const title = document.createElement('p');
    title.className = 'database-modal-copy t-amber';
    title.textContent = `Decrypting: ${parsed.metadata.title || parsed.source}`;
    const box = document.createElement('pre');
    box.className = 'database-decrypt-box';
    box.setAttribute('aria-live', 'polite');
    const hint = document.createElement('p');
    hint.className = 'database-modal-copy t-dim';
    hint.textContent = 'Running package decryption. Stand by...';
    body.append(title, box, hint);

    AudioEngine.decryptSound();
    const startedAt = performance.now();
    const duration = 5000;
    let lastRender = 0;

    function render(now) {
        const elapsed = now - startedAt;
        const progress = Math.min(100, Math.round((elapsed / duration) * 100));
        const frame = Math.floor(elapsed / 120);

        if (now - lastRender > 90 || progress >= 100) {
            lastRender = now;
            const blockA = asciiSweep(frame, 26);
            const blockB = asciiGraph(frame, 30);
            const keyNoise = Array.from({ length: 22 }, (_, index) => ((frame + index * 7) % 16).toString(16).toUpperCase()).join('');
            box.textContent = [
                '> ARES PACKAGE CRYPTOGRAPHIC HANDSHAKE',
                `  HEADER      : ${parsed.metadata.id || 'UNKNOWN'} / ${parsed.entries.length} ENTRIES`,
                `  KEY STREAM  : ${keyNoise}`,
                `  XOR PASS    : ${blockA}`,
                `  INDEX MAP   : ${blockB}`,
                `  DECRYPTION  : ${asciiBar(progress, 28)}`,
                progress >= 100 ? '  STATUS      : FINALIZING...' : `  STATUS      : RUNNING ${spinner(frame)}`
            ].join('\n');
        }

        if (elapsed < duration) {
            databaseDecryptFrame = requestAnimationFrame(render);
            return;
        }

        databaseDecryptFrame = null;
        if (passwordMatches) {
            loadParsedDatabase(parsed);
            closeDatabaseModal();
        } else {
            AudioEngine.errorBuzz();
            renderDatabasePasswordPrompt(parsed, contentGet('errors.database_password_fail', 'ACCESS DENIED - INVALID DATABASE PASSWORD'));
        }
    }

    databaseDecryptFrame = requestAnimationFrame(render);
}

function parseSimpleMetadata(lines) {
    const values = {};
    lines.forEach(line => {
        const pair = line.match(/^([a-z0-9_.-]+)\s*:\s*(.*)$/i);
        if (pair) values[normalizeStatusKey(pair[1])] = cleanStatusValue(pair[2]);
    });
    return values;
}

function parseMarkdownDatabase(content, source = 'Markdown database') {
    const clean = String(content || '')
        .replace(/\r/g, '')
        .replace(/<!--[\s\S]*?-->/g, '');
    const lines = clean.split('\n');
    const metadataLines = [];
    let startIndex = 0;
    if (lines[0]?.trim() === '---') {
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                startIndex = i + 1;
                break;
            }
            metadataLines.push(lines[i]);
        }
    }
    const metadata = parseSimpleMetadata(metadataLines);
    const entries = [];
    let category = '';
    let current = null;
    let bodyMode = false;

    function finishEntry() {
        if (!current) return;
        current.title = current.title || current.id || 'Untitled Entry';
        current.category = current.category || category || 'GENERAL';
        current.content = current.bodyLines.join('\n').trim();
        if (!current.content) current.content = 'NO BODY TEXT AVAILABLE.';
        delete current.bodyLines;
        entries.push(current);
        current = null;
        bodyMode = false;
    }

    for (let i = startIndex; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();
        if (!line) {
            if (bodyMode && current) current.bodyLines.push('');
            continue;
        }

        const categoryMatch = line.match(/^##\s+Category\s*:\s*(.+)$/i);
        if (categoryMatch) {
            finishEntry();
            category = categoryMatch[1].trim().toUpperCase();
            continue;
        }

        const entryMatch = line.match(/^###\s+(?:Entry\s*:\s*)?(.+)$/i);
        if (entryMatch) {
            finishEntry();
            current = {
                id: '',
                title: entryMatch[1].trim(),
                category,
                tags: '',
                clearance: '1',
                related: '',
                redacted: '',
                bodyLines: []
            };
            bodyMode = false;
            continue;
        }

        if (!current) continue;

        if (/^body\s*:\s*$/i.test(line)) {
            bodyMode = true;
            continue;
        }

        const pair = line.match(/^([a-z0-9_.-]+)\s*:\s*(.*)$/i);
        if (pair && !bodyMode) {
            const key = normalizeStatusKey(pair[1]);
            const value = cleanStatusValue(pair[2]);
            if (key === 'keywords') current.tags = value;
            else if (key === 'clearance_level') current.clearance = value;
            else current[key] = value;
            continue;
        }

        current.bodyLines.push(raw.replace(/^\s{0,4}/, ''));
    }
    finishEntry();

    entries.forEach(entry => {
        entry.confidential = entryRequiresAdmin(entry);
    });

    return { source, metadata, entries };
}

function loadParsedDatabase(parsed) {
    return mountParsedDatabase(parsed, activeDatabaseSelection?.item || {}, activeDatabaseSelection?.path || parsed.source || '');
}

function loadStatusProfileFile(file) {
    print('');
    print('STATUS PROFILE DETECTED', 't-amber');
    print(`Reading: ${file.name}`, 't-dim');

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const encrypted = /\.(dat|db|bin)$/i.test(file.name);
            const content = encrypted ? decodeStatusPayload(event.target.result) : event.target.result;
            const profile = parseStatusProfile(content, file.name);
            if (!profile.loaded) throw new Error('No profile keys found');
            setStatusProfile(profile);
            persistStatusProfile(profile, content);
            AudioEngine.dataLoaded();
            forceCloseRuntimeOverlays();
            print('');
            print('STATUS PROFILE LOADED', 't-cyan');
            print(`Source: ${statusProfile.source}`, 't-amber');
            print(`Fields: ${Object.keys(statusProfile.values).length}`, 't-cyan');
            print('Terminal restart required by status profile update.', 't-dim');
            print('Admin session will be revoked.', 't-amber');
            print('');
            setTimeout(restartTerminalAfterStatusLoad, prefersReducedMotion ? 120 : 900);
        } catch (error) {
            AudioEngine.errorBuzz();
            print('');
            print('ERROR: STATUS PROFILE FAILED', 't-red');
            print('No readable key/value fields were found or decryption failed.', 't-dim');
            print('Use STATUS FORMAT to view the expected layout.', 't-dim');
            print('');
        }
    };
    reader.onerror = function() {
        AudioEngine.errorBuzz();
        print('');
        print('ERROR: Could not read status profile.', 't-red');
        print('');
    };
    reader.readAsText(file);
}

function loadEncryptedFile(file) {
    print('');
    print('ENCRYPTED DATABASE DETECTED', 't-amber');
    print('Decrypting...', 't-dim');
    
    AudioEngine.decryptSound();
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const encoded = event.target.result.trim();
            const decrypted = decodeDatabasePayload(encoded);

            const markdownDatabase = parseMarkdownDatabase(decrypted, file.name);
            if (markdownDatabase.entries.length) {
                promptForParsedDatabase(markdownDatabase, { file: file.name, displayName: file.name }, file.name);
            } else if (decrypted.includes(':') && decrypted.includes('|')) {
                const legacyDatabase = parseLegacyDatabase(decrypted, file.name);
                if (!legacyDatabase.entries.length) throw new Error('No entries found');
                mountParsedDatabase(legacyDatabase, { file: file.name, displayName: file.name }, file.name);
            } else {
                throw new Error('Invalid format');
            }
        } catch (error) {
            AudioEngine.errorBuzz();
            print('');
            print('ERROR: DECRYPTION FAILED', 't-red');
            print('Database file may be corrupted.', 't-dim');
            print('');
        }
    };
    reader.onerror = function() {
        AudioEngine.errorBuzz();
        print('');
        print('ERROR: Could not read file.', 't-red');
        print('');
    };
    reader.readAsText(file);
}

function parseLegacyDatabase(content, source = 'Legacy database') {
    const entriesOut = [];
    const entries = content.split('\n\n');
    entries.forEach(entry => {
        entry = entry.trim();
        if (!entry) return;
        const colonIdx = entry.indexOf(':');
        if (colonIdx > -1) {
            const category = entry.substring(0, colonIdx).trim();
            const rest = entry.substring(colonIdx + 1);
            const pipeIdx = rest.indexOf('|');
            if (pipeIdx > -1) {
                const title = rest.substring(0, pipeIdx).trim();
                const entryContent = rest.substring(pipeIdx + 1).trim();
                const parsedEntry = { id: title.toLowerCase().replace(/\s+/g, '-'), category, title, content: entryContent, clearance: category === 'CONFIDENTIAL' ? '4' : '1' };
                parsedEntry.confidential = entryRequiresAdmin(parsedEntry);
                entriesOut.push(parsedEntry);
            }
        }
    });
    return {
        source,
        metadata: {
            title: source,
            id: source.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        },
        entries: entriesOut
    };
}

function parseDataFile(content) {
    return mountParsedDatabase(parseLegacyDatabase(content, 'Legacy database'));
}

function updateEntryCount() {
    const entries = databaseEntries.length ? databaseEntries : Object.values(database);
    const seen = new Set();
    const count = entries.filter(entry => {
        if (!entry || seen.has(entry.title)) return false;
        seen.add(entry.title);
        return !entryRequiresAdmin(entry);
    }).length;
    const counter = document.getElementById('entryCount');
    if (counter) counter.textContent = count;
}

// ========================================
// SECRET RAYCAST MINI-GAME - LIEBI
// ========================================
let liebiGameCleanup = null;

const LIEBI_MAP_TEMPLATE = [
    '########################',
    '#P..A....#......1......#',
    '#.####...#.#######.###.#',
    '#....#...D.....#...#...#',
    '####.#.#######.#.###.#.#',
    '#....#.....1...#.....#.#',
    '#.#########.#######.##.#',
    '#.....M...#.....A...#..#',
    '#.#####.#.###D#####.#.##',
    '#.#...#.#.....#...#....#',
    '#.#...#.#.#####...####.#',
    '#.#...#.....#.#...#..#.#',
    '#.#########.#.#####..#.#',
    '#.....2.....#....KR.X#.#',
    '#####.###########.####.#',
    '#...#.....VW....#......#',
    '#.#.#####.#####.######.#',
    '#.#.....#...3...#S.....#',
    '#...A...#.......#..M...#',
    '########################'
];

const LIEBI_ASSET_SOURCES = {
    pistols: 'https://opengameart.org/sites/default/files/pistols.png',
    shotguns: 'https://opengameart.org/sites/default/files/shotguns.png',
    neonpunk: 'https://opengameart.org/sites/default/files/neonpunk.png',
    armor: 'https://opengameart.org/sites/default/files/armor.png',
    enemyC: 'https://opengameart.org/sites/default/files/enemy_type_c_spritesheet_64x64x16.png',
    enemyD: 'https://opengameart.org/sites/default/files/enemy_type_d_spritesheet_64x64x8.png',
    wallChip: 'https://opengameart.org/sites/default/files/scifi_bg_chip2.png'
};

let liebiAssetCache = null;

function getLiebiAssets() {
    if (liebiAssetCache) return liebiAssetCache;
    const images = {};
    Object.entries(LIEBI_ASSET_SOURCES).forEach(([key, url]) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = url;
        images[key] = img;
    });
    liebiAssetCache = {
        images,
        ready(key) {
            const img = images[key];
            return Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
        }
    };
    return liebiAssetCache;
}

function liebiElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function createLiebiGameOverlay() {
    const overlay = liebiElement('div', 'liebi-overlay');
    overlay.id = 'liebiOverlay';
    overlay.tabIndex = -1;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'liebiTitle');

    const shell = liebiElement('div', 'liebi-shell');
    const topbar = liebiElement('div', 'liebi-topbar');
    const title = liebiElement('div', 'liebi-title glow', 'ARES BLACKSITE SIM // LIEBI');
    title.id = 'liebiTitle';
    const objective = liebiElement('div', 'liebi-objective', 'OBJECTIVE: KEYCARD / DATA SHARD / EXIT');
    const closeButton = liebiElement('button', 'liebi-close glow', '[ ESC EXIT ]');
    closeButton.type = 'button';
    closeButton.id = 'liebiClose';
    topbar.append(title, objective, closeButton);

    const stage = liebiElement('div', 'liebi-stage');
    const canvasWrap = liebiElement('div', 'liebi-canvas-wrap');
    const canvas = document.createElement('canvas');
    canvas.id = 'liebiCanvas';
    canvas.width = 360;
    canvas.height = 220;
    canvas.setAttribute('aria-label', 'Retro raycast security breach simulation');
    canvasWrap.appendChild(canvas);

    const modal = liebiElement('div', 'liebi-modal');
    modal.id = 'liebiModal';
    const modalCard = liebiElement('div', 'liebi-modal-card');
    const modalTitle = liebiElement('div', 'liebi-modal-title glow');
    modalTitle.id = 'liebiModalTitle';
    const modalText = liebiElement('div', 'liebi-modal-text');
    modalText.id = 'liebiModalText';
    const actions = liebiElement('div', 'liebi-actions');
    const restartButton = liebiElement('button', 'liebi-action', 'RESTART SIM');
    restartButton.type = 'button';
    restartButton.id = 'liebiRestart';
    const exitButton = liebiElement('button', 'liebi-action secondary', 'EXIT');
    exitButton.type = 'button';
    exitButton.id = 'liebiExit';
    actions.append(restartButton, exitButton);
    modalCard.append(modalTitle, modalText, actions);
    modal.appendChild(modalCard);
    canvasWrap.appendChild(modal);

    const hud = liebiElement('div', 'liebi-hud');
    const healthPanel = liebiPanel('HEALTH', 'liebiHealth', true);
    const armorPanel = liebiPanel('ARMOR', 'liebiArmor', true);
    const ammoPanel = liebiPanel('AMMO', 'liebiAmmo');
    const weaponPanel = liebiPanel('WEAPON', 'liebiWeapon');
    const shardPanel = liebiPanel('SHARD', 'liebiShard');
    const keyPanel = liebiPanel('KEY', 'liebiKey');
    const scorePanel = liebiPanel('SCORE', 'liebiScore');
    const statusPanel = liebiPanel('STATUS', 'liebiStatus', false, true);
    hud.append(healthPanel, armorPanel, ammoPanel, weaponPanel, shardPanel, keyPanel, scorePanel, statusPanel);
    stage.append(canvasWrap, hud);

    const footer = liebiElement('div', 'liebi-footer');
    const controls = liebiElement('div', 'liebi-controls', 'W/S MOVE | A/D TURN | Q/E STRAFE | SPACE FIRE | F USE | 1/2 WEAPON | M MAP | ESC EXIT');
    const footerStatus = liebiElement('div', 'liebi-controls', 'SINGLE LEVEL: BLACKSITE SUBLEVEL 03');
    footer.append(controls, footerStatus);

    shell.append(topbar, stage, footer);
    overlay.appendChild(shell);
    return overlay;
}

function liebiPanel(label, id, hasBar = false, wide = false) {
    const panel = liebiElement('div', wide ? 'liebi-panel wide' : 'liebi-panel');
    panel.appendChild(liebiElement('div', 'liebi-label', label));
    if (hasBar) {
        const bar = liebiElement('div', 'liebi-bar');
        const fill = liebiElement('div', 'liebi-bar-fill');
        fill.id = `${id}Bar`;
        bar.appendChild(fill);
        panel.appendChild(bar);
    }
    const value = liebiElement('div', 'liebi-value');
    value.id = id;
    panel.appendChild(value);
    return panel;
}

function createLiebiGameState() {
    const map = LIEBI_MAP_TEMPLATE.map(row => row.split(''));
    const pickups = [];
    const enemies = [];
    let exit = { x: 20.5, y: 13.5 };
    let start = { x: 1.6, y: 1.6, angle: 0.05 };

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];
            if (tile === 'P') {
                start = { x: x + 0.5, y: y + 0.5, angle: 0.05 };
                map[y][x] = '.';
            } else if (tile === 'A' || tile === 'M' || tile === 'S' || tile === 'K' || tile === 'V' || tile === 'W') {
                pickups.push({ x: x + 0.5, y: y + 0.5, type: tile, taken: false, pulse: (x + y) * 0.37 });
                map[y][x] = '.';
            } else if (tile === '1' || tile === '2' || tile === '3') {
                enemies.push(createLiebiEnemy(tile, x + 0.5, y + 0.5));
                map[y][x] = '.';
            } else if (tile === 'X') {
                exit = { x: x + 0.5, y: y + 0.5 };
            }
        }
    }

    return {
        map,
        pickups,
        exit,
        player: {
            x: start.x,
            y: start.y,
            angle: start.angle,
            health: 100,
            armor: 0,
            ammo: 26,
            shells: 0,
            weapon: 'pistol',
            weapons: { pistol: true, shotgun: false },
            shard: false,
            redKey: false,
            score: 0,
            kills: 0
        },
        enemies,
        totalEnemies: enemies.length,
        keys: new Set(),
        minimap: true,
        lastShot: 0,
        muzzle: 0,
        damageFlash: 0,
        recoil: 0,
        message: 'BREACH SIM READY. FIND KEYCARD AND SHARD.',
        messageUntil: 0,
        exitWarnAt: 0,
        won: false,
        lost: false
    };
}

function createLiebiEnemy(tile, x, y) {
    if (tile === '2') {
        return { x, y, type: 'drone', hp: 5, maxHp: 5, speed: 0.66, damage: 11, attackRange: 1.05, attackDelay: 850, lastAttack: 0, hitFlash: 0, dead: false, alert: false };
    }
    if (tile === '3') {
        return { x, y, type: 'ic', hp: 7, maxHp: 7, speed: 0.43, damage: 15, attackRange: 5.4, attackDelay: 1450, lastAttack: 0, hitFlash: 0, dead: false, alert: false };
    }
    return { x, y, type: 'guard', hp: 4, maxHp: 4, speed: 0.58, damage: 8, attackRange: 3.9, attackDelay: 1200, lastAttack: 0, hitFlash: 0, dead: false, alert: false };
}

function liebiTileAt(game, x, y) {
    const row = game.map[y];
    if (!row || x < 0 || x >= row.length) return '#';
    return row[x] || '#';
}

function liebiSetTile(game, x, y, tile) {
    if (game.map[y] && x >= 0 && x < game.map[y].length) game.map[y][x] = tile;
}

function liebiIsBlocking(game, x, y) {
    const tile = liebiTileAt(game, Math.floor(x), Math.floor(y));
    return tile === '#' || tile === 'D' || tile === 'R';
}

function liebiCanOccupy(game, x, y) {
    const radius = 0.18;
    return !liebiIsBlocking(game, x - radius, y - radius) &&
        !liebiIsBlocking(game, x + radius, y - radius) &&
        !liebiIsBlocking(game, x - radius, y + radius) &&
        !liebiIsBlocking(game, x + radius, y + radius);
}

function liebiTryMoveEntity(game, entity, dx, dy) {
    const nextX = entity.x + dx;
    const nextY = entity.y + dy;
    if (liebiCanOccupy(game, nextX, entity.y)) entity.x = nextX;
    if (liebiCanOccupy(game, entity.x, nextY)) entity.y = nextY;
}

function normalizeAngle(angle) {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
}

function liebiCastRay(game, angle) {
    const player = game.player;
    const rayDirX = Math.cos(angle) || 0.0001;
    const rayDirY = Math.sin(angle) || 0.0001;
    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;
    let sideDistX = rayDirX < 0 ? (player.x - mapX) * deltaDistX : (mapX + 1 - player.x) * deltaDistX;
    let sideDistY = rayDirY < 0 ? (player.y - mapY) * deltaDistY : (mapY + 1 - player.y) * deltaDistY;
    let side = 0;
    let tile = '.';

    for (let i = 0; i < 36; i++) {
        if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
        } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
        }

        tile = liebiTileAt(game, mapX, mapY);
        if (tile === '#' || tile === 'D' || tile === 'R') break;
    }

    const distance = side === 0
        ? (mapX - player.x + (1 - stepX) / 2) / rayDirX
        : (mapY - player.y + (1 - stepY) / 2) / rayDirY;
    let wallX = side === 0
        ? player.y + distance * rayDirY
        : player.x + distance * rayDirX;
    wallX -= Math.floor(wallX);

    return {
        distance: Math.max(0.001, Math.abs(distance)),
        tile,
        side,
        mapX,
        mapY,
        wallX
    };
}

function liebiLineOfSight(game, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(distance / 0.12));
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (liebiIsBlocking(game, x1 + dx * t, y1 + dy * t)) return false;
    }
    return true;
}

function liebiColor(base, shade) {
    const factor = Math.max(0.08, Math.min(1, shade));
    return `rgb(${Math.round(base[0] * factor)}, ${Math.round(base[1] * factor)}, ${Math.round(base[2] * factor)})`;
}

function liebiSfx(kind) {
    if (!AudioEngine.canPlay()) return;
    if (kind === 'shot') {
        AudioEngine.sequence([
            { type: 'square', frequency: 58, endFrequency: 34, duration: 0.09, gain: 0.09, filterFrequency: 150, attack: 0.002, throttleKey: 'liebiShot', minInterval: 0.08 },
            { type: 'triangle', frequency: 29, duration: 0.12, gain: 0.035, filterFrequency: 80, startOffset: 0.015 }
        ]);
    } else if (kind === 'hit') {
        AudioEngine.tone({ type: 'sawtooth', frequency: 72, endFrequency: 46, duration: 0.08, gain: 0.07, filterFrequency: 160, throttleKey: 'liebiHit', minInterval: 0.04 });
    } else if (kind === 'hurt') {
        AudioEngine.errorBuzz();
    } else if (kind === 'pickup') {
        AudioEngine.sequence([
            { type: 'triangle', frequency: 82, duration: 0.06, gain: 0.058, filterFrequency: 180 },
            { type: 'triangle', frequency: 118, duration: 0.08, gain: 0.05, filterFrequency: 220, startOffset: 0.06 }
        ]);
    } else if (kind === 'door') {
        AudioEngine.tone({ type: 'square', frequency: 48, endFrequency: 62, duration: 0.1, gain: 0.05, filterFrequency: 150, throttleKey: 'liebiDoor', minInterval: 0.2 });
    } else if (kind === 'locked') {
        AudioEngine.sequence([
            { type: 'sawtooth', frequency: 44, endFrequency: 31, duration: 0.12, gain: 0.06, filterFrequency: 120, throttleKey: 'liebiLocked', minInterval: 0.22 },
            { type: 'square', frequency: 31, duration: 0.08, gain: 0.03, filterFrequency: 90, startOffset: 0.05 }
        ]);
    } else if (kind === 'shotgun') {
        AudioEngine.sequence([
            { type: 'square', frequency: 42, endFrequency: 24, duration: 0.15, gain: 0.11, filterFrequency: 130, throttleKey: 'liebiShotgun', minInterval: 0.25 },
            { type: 'triangle', frequency: 25, duration: 0.18, gain: 0.045, filterFrequency: 75, startOffset: 0.02 }
        ]);
    } else if (kind === 'win') {
        AudioEngine.successTone();
    }
}

function closeLiebiGame() {
    if (liebiGameCleanup) liebiGameCleanup();
}

function startLiebiGame() {
    if (liebiGameCleanup || document.getElementById('liebiOverlay')) return;

    const overlay = createLiebiGameOverlay();
    document.body.appendChild(overlay);
    overlay.focus();

    const canvas = overlay.querySelector('#liebiCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
        overlay.remove();
        return;
    }
    ctx.imageSmoothingEnabled = false;

    const ui = {
        health: overlay.querySelector('#liebiHealth'),
        healthBar: overlay.querySelector('#liebiHealthBar'),
        armor: overlay.querySelector('#liebiArmor'),
        armorBar: overlay.querySelector('#liebiArmorBar'),
        ammo: overlay.querySelector('#liebiAmmo'),
        weapon: overlay.querySelector('#liebiWeapon'),
        shard: overlay.querySelector('#liebiShard'),
        key: overlay.querySelector('#liebiKey'),
        score: overlay.querySelector('#liebiScore'),
        status: overlay.querySelector('#liebiStatus'),
        close: overlay.querySelector('#liebiClose'),
        modal: overlay.querySelector('#liebiModal'),
        modalTitle: overlay.querySelector('#liebiModalTitle'),
        modalText: overlay.querySelector('#liebiModalText'),
        restart: overlay.querySelector('#liebiRestart'),
        exit: overlay.querySelector('#liebiExit')
    };

    const game = createLiebiGameState();
    const width = canvas.width;
    const height = canvas.height;
    const fov = Math.PI / 3;
    const liebiFontFamily = getComputedStyle(document.body).fontFamily;
    const liebiAssets = getLiebiAssets();
    const zBuffer = new Float32Array(width);
    let frameId = null;
    let lastTime = 0;
    let hudCache = '';
    let closed = false;

    function setMessage(text, duration = 1800) {
        game.message = text;
        game.messageUntil = performance.now() + duration;
        updateHud(true);
    }

    function finishGame(won) {
        if (game.won || game.lost) return;
        game.won = won;
        game.lost = !won;
        ui.modal.classList.add('active');
        ui.modalTitle.textContent = won ? 'EXTRACTION COMPLETE' : 'SIMULATION FAILED';
        ui.modalText.textContent = won
            ? `Data shard recovered. Hostiles neutralized ${game.player.kills}/${game.totalEnemies}. Score ${game.player.score}.`
            : 'Personnel asset neutralized. Ares recommends improved obedience and faster reflexes.';
        liebiSfx(won ? 'win' : 'hurt');
        updateHud(true);
    }

    function useNearby() {
        const player = game.player;
        const tx = Math.floor(player.x + Math.cos(player.angle) * 1.05);
        const ty = Math.floor(player.y + Math.sin(player.angle) * 1.05);
        const tile = liebiTileAt(game, tx, ty);
        if (tile === 'D') {
            liebiSetTile(game, tx, ty, '.');
            player.score += 15;
            liebiSfx('door');
            setMessage('SECURITY DOOR OVERRIDE ACCEPTED');
        } else if (tile === 'R') {
            if (player.redKey) {
                liebiSetTile(game, tx, ty, '.');
                player.score += 80;
                liebiSfx('door');
                setMessage('RED KEYCARD ACCEPTED. EXIT ROUTE OPEN.', 2200);
            } else {
                liebiSfx('locked');
                setMessage('RED SECURITY LOCK: KEYCARD REQUIRED', 1500);
            }
        } else {
            setMessage('NO USABLE SURFACE IN RANGE', 650);
        }
    }

    function handlePickups() {
        const player = game.player;
        game.pickups.forEach(pickup => {
            if (pickup.taken || Math.hypot(pickup.x - player.x, pickup.y - player.y) > 0.45) return;
            pickup.taken = true;
            liebiSfx('pickup');
            if (pickup.type === 'A') {
                player.ammo += 12;
                player.score += 40;
                setMessage('PISTOL AMMO CACHE ACQUIRED');
            } else if (pickup.type === 'M') {
                player.health = Math.min(100, player.health + 32);
                player.score += 30;
                setMessage('DOCWAGON FIELD PATCH APPLIED');
            } else if (pickup.type === 'S') {
                player.shard = true;
                player.score += 500;
                setMessage('DATA SHARD SECURED. PROCEED TO EXIT.', 2600);
            } else if (pickup.type === 'K') {
                player.redKey = true;
                player.score += 220;
                setMessage('RED SECURITY KEYCARD ACQUIRED', 2200);
            } else if (pickup.type === 'V') {
                player.armor = Math.min(100, player.armor + 65);
                player.score += 70;
                setMessage('ARMOR VEST SEALED');
            } else if (pickup.type === 'W') {
                player.weapons.shotgun = true;
                player.weapon = 'shotgun';
                player.shells += 8;
                player.score += 180;
                liebiSfx('shotgun');
                setMessage('ARES ROOM-BROOM SHOTGUN ONLINE', 2400);
            }
        });
    }

    function checkExit(now) {
        const player = game.player;
        if (liebiTileAt(game, Math.floor(player.x), Math.floor(player.y)) !== 'X') return;
        if (player.shard && player.redKey) {
            player.score += 1000 + player.health * 3 + player.armor * 2 + player.kills * 120;
            finishGame(true);
        } else if (now - game.exitWarnAt > 1200) {
            game.exitWarnAt = now;
            const missing = [];
            if (!player.shard) missing.push('DATA SHARD');
            if (!player.redKey) missing.push('RED KEYCARD');
            setMessage(`EXIT LOCKED: ${missing.join(' / ')} REQUIRED`);
            liebiSfx('locked');
        }
    }

    function activeWeaponConfig() {
        if (game.player.weapon === 'shotgun' && game.player.weapons.shotgun) {
            return { id: 'shotgun', name: 'ROOM-BROOM', ammoKey: 'shells', cost: 1, damage: 5, range: 6.4, delay: 620, cone: 0.22, pelletTargets: 3 };
        }
        return { id: 'pistol', name: 'ARES PREDATOR', ammoKey: 'ammo', cost: 1, damage: 2, range: 9, delay: 240, cone: 0.085, pelletTargets: 1 };
    }

    function switchWeapon(id) {
        if (id === 'shotgun' && !game.player.weapons.shotgun) {
            setMessage('SHOTGUN NOT ACQUIRED', 900);
            liebiSfx('locked');
            return;
        }
        game.player.weapon = id;
        setMessage(`${activeWeaponConfig().name} SELECTED`, 800);
        updateHud(true);
    }

    function applyPlayerDamage(amount, source) {
        const player = game.player;
        const armorBlock = Math.min(player.armor, Math.ceil(amount * 0.55));
        player.armor -= armorBlock;
        player.health = Math.max(0, player.health - (amount - armorBlock));
        game.damageFlash = 0.42;
        setMessage(source, 900);
        liebiSfx('hurt');
        if (player.health <= 0) finishGame(false);
    }

    function shoot(now) {
        const player = game.player;
        const weapon = activeWeaponConfig();
        if (game.won || game.lost || now - game.lastShot < weapon.delay) return;
        if (player[weapon.ammoKey] < weapon.cost) {
            setMessage('WEAPON DRY');
            AudioEngine.errorBuzz();
            game.lastShot = now;
            return;
        }

        player[weapon.ammoKey] -= weapon.cost;
        game.lastShot = now;
        game.muzzle = weapon.id === 'shotgun' ? 0.22 : 0.12;
        game.recoil = weapon.id === 'shotgun' ? 0.35 : 0.16;
        liebiSfx(weapon.id === 'shotgun' ? 'shotgun' : 'shot');

        const targets = [];
        game.enemies.forEach(enemy => {
            if (enemy.dead) return;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.hypot(dx, dy);
            const angle = Math.abs(normalizeAngle(Math.atan2(dy, dx) - player.angle));
            const tolerance = weapon.cone + Math.min(0.16, 0.18 / Math.max(1, distance));
            if (distance < weapon.range && angle < tolerance && liebiLineOfSight(game, player.x, player.y, enemy.x, enemy.y)) {
                targets.push({ enemy, distance, angle });
            }
        });
        targets.sort((a, b) => a.distance - b.distance);

        if (!targets.length) {
            setMessage('ROUND IMPACT: NO TARGET LOCK', 750);
            return;
        }

        let killed = 0;
        targets.slice(0, weapon.pelletTargets).forEach((targetInfo, index) => {
            const target = targetInfo.enemy;
            const falloff = weapon.id === 'shotgun' ? Math.max(0.45, 1 - targetInfo.distance / 9 - index * 0.12) : 1;
            const damage = Math.max(1, Math.round(weapon.damage * falloff));
            target.hp -= damage;
            target.hitFlash = 0.18;
            target.alert = true;
            player.score += 35 + damage * 12;
            if (target.hp <= 0 && !target.dead) {
                target.dead = true;
                killed++;
                player.kills++;
                player.score += target.type === 'ic' ? 260 : (target.type === 'drone' ? 190 : 150);
            }
        });

        liebiSfx('hit');
        setMessage(killed ? `${killed} HOSTILE${killed === 1 ? '' : 'S'} NEUTRALIZED` : 'TARGET ARMOR BREACHED', killed ? 1400 : 700);
    }

    function updateGame(delta, now) {
        if (game.won || game.lost) return;
        const player = game.player;
        const turnSpeed = 2.45;
        const moveSpeed = 2.25;
        const strafeSpeed = 1.85;

        if (game.keys.has('a')) player.angle -= turnSpeed * delta;
        if (game.keys.has('d')) player.angle += turnSpeed * delta;
        player.angle = normalizeAngle(player.angle);

        let forward = 0;
        let strafe = 0;
        if (game.keys.has('w')) forward += 1;
        if (game.keys.has('s')) forward -= 1;
        if (game.keys.has('e')) strafe += 1;
        if (game.keys.has('q')) strafe -= 1;

        const cos = Math.cos(player.angle);
        const sin = Math.sin(player.angle);
        const dx = (cos * forward * moveSpeed + Math.cos(player.angle + Math.PI / 2) * strafe * strafeSpeed) * delta;
        const dy = (sin * forward * moveSpeed + Math.sin(player.angle + Math.PI / 2) * strafe * strafeSpeed) * delta;
        if (dx || dy) liebiTryMoveEntity(game, player, dx, dy);

        handlePickups();
        checkExit(now);

        game.damageFlash = Math.max(0, game.damageFlash - delta * 2.8);
        game.muzzle = Math.max(0, game.muzzle - delta);
        game.recoil = Math.max(0, game.recoil - delta * 2.4);
        game.enemies.forEach(enemy => {
            enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
            if (enemy.dead) return;

            const enemyDx = player.x - enemy.x;
            const enemyDy = player.y - enemy.y;
            const distance = Math.hypot(enemyDx, enemyDy);
            const canSee = distance < 8.8 && liebiLineOfSight(game, enemy.x, enemy.y, player.x, player.y);
            if (canSee) enemy.alert = true;
            if (!enemy.alert) return;

            if (distance > enemy.attackRange * 0.78) {
                liebiTryMoveEntity(game, enemy, (enemyDx / distance) * enemy.speed * delta, (enemyDy / distance) * enemy.speed * delta);
            }

            if (canSee && distance <= enemy.attackRange && now - enemy.lastAttack > enemy.attackDelay) {
                enemy.lastAttack = now;
                applyPlayerDamage(enemy.damage, enemy.type === 'ic' ? 'IC SPIKE DETECTED' : (enemy.type === 'drone' ? 'DRONE IMPACT TRAUMA' : 'SECURITY BURST IMPACT'));
            }
        });
    }

    function drawWalls() {
        const ceilingGradient = ctx.createLinearGradient(0, 0, 0, height / 2);
        ceilingGradient.addColorStop(0, '#0b1024');
        ceilingGradient.addColorStop(0.58, '#050713');
        ceilingGradient.addColorStop(1, '#020402');
        ctx.fillStyle = ceilingGradient;
        ctx.fillRect(0, 0, width, height / 2);
        const floorGradient = ctx.createLinearGradient(0, height / 2, 0, height);
        floorGradient.addColorStop(0, '#03100c');
        floorGradient.addColorStop(1, '#000100');
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, height / 2, width, height / 2);

        for (let y = Math.floor(height / 2); y < height; y += 8) {
            const alpha = (y - height / 2) / (height / 2);
            ctx.fillStyle = `rgba(32, 194, 14, ${0.025 + alpha * 0.035})`;
            ctx.fillRect(0, y, width, 1);
        }

        for (let x = 0; x < width; x++) {
            const rayAngle = game.player.angle - fov / 2 + (x / width) * fov;
            const ray = liebiCastRay(game, rayAngle);
            const corrected = ray.distance * Math.cos(rayAngle - game.player.angle);
            zBuffer[x] = corrected;
            const wallHeight = Math.min(height * 1.7, height / corrected);
            const y = Math.floor(height / 2 - wallHeight / 2);
            const shade = Math.max(0.15, 1 - corrected / 11) * (ray.side ? 0.74 : 1);
            const base = ray.tile === 'R' ? [255, 51, 51] : (ray.tile === 'D' ? [255, 176, 0] : [32, 194, 14]);
            const drawHeight = Math.ceil(wallHeight);
            const wallTop = y;
            if (ray.tile === '#' && liebiAssets.ready('wallChip')) {
                const texture = liebiAssets.images.wallChip;
                const texX = Math.max(0, Math.min(texture.naturalWidth - 1, Math.floor(ray.wallX * texture.naturalWidth)));
                ctx.drawImage(texture, texX, 0, 1, texture.naturalHeight, x, wallTop, 1, drawHeight);
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, 0.58 - shade * 0.42)})`;
                ctx.fillRect(x, wallTop, 1, drawHeight);
                ctx.fillStyle = `rgba(32, 194, 14, ${0.05 * shade})`;
                ctx.fillRect(x, wallTop, 1, drawHeight);
            } else {
                ctx.fillStyle = liebiColor(base, shade);
                ctx.fillRect(x, wallTop, 1, drawHeight);
            }
            if (ray.tile === 'D' || ray.tile === 'R') {
                const band = Math.floor(ray.wallX * 8) % 2 === 0;
                ctx.fillStyle = band ? `rgba(0, 0, 0, ${0.25 + (1 - shade) * 0.25})` : `rgba(255, 255, 255, ${0.045 * shade})`;
                ctx.fillRect(x, wallTop, 1, drawHeight);
            }
            if (x % 7 === 0) {
                ctx.fillStyle = `rgba(0, 212, 170, ${0.08 * shade})`;
                ctx.fillRect(x, wallTop, 1, drawHeight);
            }
        }
    }

    function drawSpriteFrame(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!image || !image.naturalWidth || !image.naturalHeight) return false;
        const sourceX = Math.max(0, Math.min(image.naturalWidth - 1, sx));
        const sourceY = Math.max(0, Math.min(image.naturalHeight - 1, sy));
        const sourceW = Math.max(1, Math.min(sw, image.naturalWidth - sourceX));
        const sourceH = Math.max(1, Math.min(sh, image.naturalHeight - sourceY));
        ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, dx, dy, dw, dh);
        return true;
    }

    function drawEnemySprite(enemy, screenX, screenY, size, now) {
        const half = size / 2;
        const frameSeed = Math.floor(now / 140 + enemy.x * 2 + enemy.y);
        if ((enemy.type === 'drone' || enemy.type === 'ic') && liebiAssets.ready(enemy.type === 'ic' ? 'enemyD' : 'enemyC')) {
            const sheetKey = enemy.type === 'ic' ? 'enemyD' : 'enemyC';
            const sheet = liebiAssets.images[sheetKey];
            const cols = enemy.type === 'ic' ? 8 : 8;
            const frameCount = enemy.type === 'ic' ? 8 : 16;
            const frame = frameSeed % frameCount;
            const sx = (frame % cols) * 64;
            const sy = Math.floor(frame / cols) * 64;
            ctx.save();
            ctx.globalAlpha = enemy.hitFlash > 0 ? 0.68 : 0.98;
            if (enemy.hitFlash > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(screenX - half * 0.72, screenY - half * 0.72, size * 0.95, size * 0.95);
            }
            drawSpriteFrame(sheet, sx, sy, 64, 64, screenX - half, screenY - half, size, size);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.globalAlpha = enemy.hitFlash > 0 ? 1 : 0.94;
        ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : (enemy.type === 'ic' ? '#150016' : (enemy.type === 'guard' ? '#141008' : '#07110b'));
        ctx.strokeStyle = enemy.type === 'ic' ? '#ff00ff' : (enemy.type === 'guard' ? '#ffb000' : '#ff3333');
        ctx.lineWidth = Math.max(1, size / 36);
        if (enemy.type === 'ic') {
            ctx.beginPath();
            ctx.moveTo(0, -half);
            ctx.lineTo(half * 0.75, 0);
            ctx.lineTo(0, half);
            ctx.lineTo(-half * 0.75, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffb000';
            ctx.fillRect(-size * 0.16, -size * 0.05, size * 0.32, size * 0.1);
        } else if (enemy.type === 'guard') {
            ctx.fillRect(-half * 0.34, -half * 0.72, size * 0.68, size * 0.9);
            ctx.strokeRect(-half * 0.34, -half * 0.72, size * 0.68, size * 0.9);
            ctx.fillStyle = '#20c20e';
            ctx.fillRect(-half * 0.22, -half * 0.52, size * 0.44, size * 0.08);
            ctx.strokeStyle = '#ff3333';
            ctx.beginPath();
            ctx.moveTo(half * 0.25, -half * 0.12);
            ctx.lineTo(half * 0.78, half * 0.08);
            ctx.stroke();
        } else {
            ctx.fillRect(-half * 0.72, -half * 0.55, size * 0.72, size * 0.72);
            ctx.strokeRect(-half * 0.72, -half * 0.55, size * 0.72, size * 0.72);
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(-half * 0.52, -half * 0.31, size * 0.34, size * 0.08);
            ctx.strokeStyle = '#00d4aa';
            ctx.beginPath();
            ctx.moveTo(-half * 0.72, half * 0.05);
            ctx.lineTo(-half, half * 0.32);
            ctx.moveTo(0, half * 0.05);
            ctx.lineTo(half * 0.28, half * 0.32);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawPickupSprite(pickup, screenX, screenY, size, now) {
        const pulse = 0.82 + Math.sin(now * 0.004 + pickup.pulse) * 0.18;
        const drawSize = size * pulse;
        ctx.save();
        ctx.translate(screenX, screenY);
        const pickupColor = {
            S: '#ffb000',
            M: '#ff3333',
            K: '#ff3333',
            V: '#20c20e',
            W: '#ffb000',
            A: '#00d4aa'
        }[pickup.type] || '#00d4aa';
        const pickupLabel = {
            S: 'DATA',
            M: '+',
            K: 'KEY',
            V: 'ARM',
            W: 'SG',
            A: 'AMMO'
        }[pickup.type] || 'ITEM';
        const sprite = {
            A: ['pistols', 64, 0, 32, 32],
            W: ['shotguns', 0, 0, 64, 32],
            K: ['neonpunk', 0, 0, 32, 32],
            S: ['neonpunk', 32, 0, 32, 32],
            V: ['armor', 0, 0, 32, 32],
            M: ['neonpunk', 64, 0, 32, 32]
        }[pickup.type];
        ctx.strokeStyle = pickupColor;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.fillRect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
        if (sprite && liebiAssets.ready(sprite[0])) {
            const image = liebiAssets.images[sprite[0]];
            const [sheetKey, sx, sy, sw, sh] = sprite;
            const spriteSize = drawSize * (pickup.type === 'W' ? 0.96 : 0.78);
            drawSpriteFrame(image, sx, sy, sw, sh, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
        } else {
            ctx.fillStyle = ctx.strokeStyle;
            ctx.font = `${Math.max(8, Math.floor(drawSize * 0.36))}px ${liebiFontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pickupLabel, 0, 0);
        }
        ctx.restore();
    }

    function drawExitSprite(now) {
        const dx = game.exit.x - game.player.x;
        const dy = game.exit.y - game.player.y;
        drawBillboard({ x: game.exit.x, y: game.exit.y }, 0.42, (screenX, screenY, size) => {
            ctx.save();
            ctx.translate(screenX, screenY);
            const exitOpen = game.player.shard && game.player.redKey;
            ctx.strokeStyle = exitOpen ? '#20c20e' : '#8b6914';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
            ctx.globalAlpha = Math.max(0.55, 0.9 - Math.hypot(dx, dy) * 0.04);
            ctx.strokeRect(-size / 2, -size / 2, size, size);
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.fillStyle = exitOpen ? '#20c20e' : '#ffb000';
            ctx.font = `${Math.max(7, Math.floor(size * 0.25))}px ${liebiFontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(exitOpen ? 'EXIT' : 'LOCK', 0, Math.sin(now * 0.005) * 2);
            ctx.restore();
        });
    }

    function drawBillboard(sprite, sizeScale, drawCallback) {
        const dx = sprite.x - game.player.x;
        const dy = sprite.y - game.player.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 0.2) return;
        const angle = normalizeAngle(Math.atan2(dy, dx) - game.player.angle);
        if (Math.abs(angle) > fov / 2 + 0.25) return;
        const screenX = (0.5 + angle / fov) * width;
        const size = Math.min(120, Math.max(8, (height / distance) * sizeScale));
        const screenY = height / 2 + size * 0.2;
        const bufferIndex = Math.max(0, Math.min(width - 1, Math.floor(screenX)));
        if (distance > zBuffer[bufferIndex] + 0.15) return;
        drawCallback(screenX, screenY, size, distance);
    }

    function drawSprites(now) {
        const sprites = [];
        game.pickups.forEach(pickup => {
            if (!pickup.taken) sprites.push({ kind: 'pickup', item: pickup, dist: Math.hypot(pickup.x - game.player.x, pickup.y - game.player.y) });
        });
        game.enemies.forEach(enemy => {
            if (!enemy.dead) sprites.push({ kind: 'enemy', item: enemy, dist: Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y) });
        });
        sprites.sort((a, b) => b.dist - a.dist);
        sprites.forEach(sprite => {
            drawBillboard(sprite.item, sprite.kind === 'enemy' ? 0.76 : 0.36, (screenX, screenY, size) => {
                if (sprite.kind === 'enemy') drawEnemySprite(sprite.item, screenX, screenY, size, now);
                else drawPickupSprite(sprite.item, screenX, screenY, size, now);
            });
        });
        drawExitSprite(now);
    }

    function drawWeapon() {
        const bob = Math.sin(performance.now() * 0.008) * 1.5 + game.recoil * 12;
        const shotgun = game.player.weapon === 'shotgun' && game.player.weapons.shotgun;
        const weaponSheet = shotgun ? 'shotguns' : 'pistols';
        const weaponImage = liebiAssets.images[weaponSheet];
        if (liebiAssets.ready(weaponSheet)) {
            const spriteWidth = shotgun ? 96 : 72;
            const spriteHeight = shotgun ? 48 : 42;
            const sx = shotgun ? 0 : 0;
            const sy = 0;
            ctx.save();
            ctx.shadowColor = shotgun ? '#ffb000' : '#20c20e';
            ctx.shadowBlur = 4;
            drawSpriteFrame(weaponImage, sx, sy, shotgun ? 96 : 64, 32, width / 2 - spriteWidth / 2, height - spriteHeight - 2 + bob, spriteWidth, spriteHeight);
            ctx.restore();
            if (game.muzzle > 0) {
                ctx.fillStyle = '#ffb000';
                ctx.beginPath();
                ctx.moveTo(width / 2 + (shotgun ? 44 : 32), height - spriteHeight + bob);
                ctx.lineTo(width / 2 + (shotgun ? 68 : 48), height - spriteHeight - 9 + bob);
                ctx.lineTo(width / 2 + (shotgun ? 57 : 39), height - spriteHeight + 13 + bob);
                ctx.fill();
            }
            return;
        }

        ctx.fillStyle = '#050505';
        ctx.fillRect(width / 2 - (shotgun ? 42 : 28), height - 38 + bob, shotgun ? 84 : 56, 38);
        ctx.strokeStyle = shotgun ? '#ffb000' : '#20c20e';
        ctx.strokeRect(width / 2 - (shotgun ? 38 : 24), height - 34 + bob, shotgun ? 76 : 48, 30);
        ctx.fillStyle = '#1a2c1a';
        ctx.fillRect(width / 2 - (shotgun ? 28 : 14), height - 50 + bob, shotgun ? 56 : 28, 26);
        ctx.strokeStyle = '#00d4aa';
        ctx.strokeRect(width / 2 - (shotgun ? 28 : 14), height - 50 + bob, shotgun ? 56 : 28, 26);
        if (game.muzzle > 0) {
            ctx.fillStyle = '#ffb000';
            ctx.beginPath();
            ctx.moveTo(width / 2, height - 58 + bob);
            ctx.lineTo(width / 2 - (shotgun ? 28 : 14), height - (shotgun ? 92 : 80) + bob);
            ctx.lineTo(width / 2 + (shotgun ? 30 : 15), height - (shotgun ? 88 : 77) + bob);
            ctx.fill();
        }
    }

    function drawMinimap() {
        if (!game.minimap) return;
        const scale = 4;
        const ox = 8;
        const oy = 8;
        ctx.save();
        ctx.globalAlpha = 0.84;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.66)';
        ctx.fillRect(ox - 3, oy - 3, game.map[0].length * scale + 6, game.map.length * scale + 6);
        for (let y = 0; y < game.map.length; y++) {
            for (let x = 0; x < game.map[y].length; x++) {
                const tile = game.map[y][x];
                if (tile === '#') ctx.fillStyle = '#176d12';
                else if (tile === 'D') ctx.fillStyle = '#8b6914';
                else if (tile === 'R') ctx.fillStyle = '#a32020';
                else if (tile === 'X') ctx.fillStyle = '#00d4aa';
                else ctx.fillStyle = 'rgba(32,194,14,0.12)';
                ctx.fillRect(ox + x * scale, oy + y * scale, scale - 1, scale - 1);
            }
        }
        game.enemies.forEach(enemy => {
            if (enemy.dead) return;
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(ox + enemy.x * scale - 1, oy + enemy.y * scale - 1, 2, 2);
        });
        ctx.fillStyle = '#ffb000';
        ctx.beginPath();
        ctx.arc(ox + game.player.x * scale, oy + game.player.y * scale, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffb000';
        ctx.beginPath();
        ctx.moveTo(ox + game.player.x * scale, oy + game.player.y * scale);
        ctx.lineTo(ox + (game.player.x + Math.cos(game.player.angle) * 1.2) * scale, oy + (game.player.y + Math.sin(game.player.angle) * 1.2) * scale);
        ctx.stroke();
        ctx.restore();
    }

    function drawCrosshair() {
        ctx.save();
        ctx.strokeStyle = game.player.weapon === 'shotgun' ? 'rgba(255,176,0,0.72)' : 'rgba(32,194,14,0.72)';
        ctx.lineWidth = 1;
        const cx = Math.floor(width / 2);
        const cy = Math.floor(height / 2);
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy);
        ctx.lineTo(cx - 2, cy);
        ctx.moveTo(cx + 2, cy);
        ctx.lineTo(cx + 6, cy);
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx, cy - 2);
        ctx.moveTo(cx, cy + 2);
        ctx.lineTo(cx, cy + 6);
        ctx.stroke();
        ctx.restore();
    }

    function renderGame(now) {
        drawWalls();
        drawSprites(now);
        drawCrosshair();
        drawWeapon();
        drawMinimap();

        if (now < game.messageUntil) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
            ctx.fillRect(0, 0, width, 16);
            ctx.fillStyle = '#ffb000';
            ctx.font = `8px ${liebiFontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(game.message, width / 2, 8);
        }

        if (game.damageFlash > 0) {
            ctx.fillStyle = `rgba(255, 51, 51, ${Math.min(0.32, game.damageFlash)})`;
            ctx.fillRect(0, 0, width, height);
        }
    }

    function updateHud(force = false) {
        const player = game.player;
        const liveEnemies = game.enemies.filter(enemy => !enemy.dead).length;
        const status = game.won ? 'EXTRACTED' : (game.lost ? 'FLATLINED' : (nowStatus() || 'RUNNING'));
        const message = performance.now() < game.messageUntil ? game.message : status;
        const weapon = activeWeaponConfig();
        const key = `${player.health}|${player.armor}|${player.ammo}|${player.shells}|${player.weapon}|${player.weapons.shotgun}|${player.shard}|${player.redKey}|${player.score}|${player.kills}|${liveEnemies}|${message}|${game.minimap}|${game.won}|${game.lost}`;
        if (!force && key === hudCache) return;
        hudCache = key;
        ui.health.textContent = `${String(player.health).padStart(3, '0')}%`;
        ui.healthBar.style.transform = `scaleX(${Math.max(0, player.health) / 100})`;
        ui.armor.textContent = `${String(player.armor).padStart(3, '0')}%`;
        ui.armorBar.style.transform = `scaleX(${Math.max(0, player.armor) / 100})`;
        ui.ammo.textContent = `P:${String(player.ammo).padStart(2, '0')} S:${String(player.shells).padStart(2, '0')}`;
        ui.weapon.textContent = weapon.name;
        ui.shard.textContent = player.shard ? 'SECURED' : 'MISSING';
        ui.key.textContent = player.redKey ? 'RED OK' : 'NO KEY';
        ui.score.textContent = String(player.score).padStart(5, '0');
        ui.status.textContent = `${message}\nKILLS: ${player.kills}/${game.totalEnemies}  HOSTILES: ${liveEnemies}\nMINIMAP: ${game.minimap ? 'ON' : 'OFF'}`;
    }

    function nowStatus() {
        if (!game.player.weapons.shotgun) return 'FIND ARMORY CACHE';
        if (!game.player.redKey) return 'FIND RED KEYCARD';
        if (!game.player.shard) return 'RECOVER DATA SHARD';
        return 'UNLOCK EXIT AND EXTRACT';
    }

    function gameLoop(timestamp = 0) {
        if (closed) return;
        if (document.hidden) {
            lastTime = timestamp;
            frameId = requestAnimationFrame(gameLoop);
            return;
        }

        const delta = lastTime ? Math.min(0.05, Math.max(0, (timestamp - lastTime) / 1000)) : 0.016;
        lastTime = timestamp;
        updateGame(delta, timestamp);
        renderGame(timestamp);
        updateHud();
        frameId = requestAnimationFrame(gameLoop);
    }

    function handleKeyDown(event) {
        const key = event.key.toLowerCase();
        const handled = ['w', 'a', 's', 'd', 'q', 'e', 'f', 'm', '1', '2', 'escape'].includes(key) || event.code === 'Space';
        if (!handled) return;
        event.preventDefault();
        event.stopPropagation();

        if (key === 'escape') {
            closeLiebiGame();
            return;
        }
        if (key === 'f' && !event.repeat) {
            useNearby();
            return;
        }
        if (key === 'm' && !event.repeat) {
            game.minimap = !game.minimap;
            updateHud(true);
            return;
        }
        if (key === '1' && !event.repeat) {
            switchWeapon('pistol');
            return;
        }
        if (key === '2' && !event.repeat) {
            switchWeapon('shotgun');
            return;
        }
        if (event.code === 'Space') {
            if (!event.repeat) shoot(performance.now());
            return;
        }
        game.keys.add(key);
    }

    function handleKeyUp(event) {
        game.keys.delete(event.key.toLowerCase());
    }

    function cleanup() {
        if (closed) return;
        closed = true;
        if (frameId) cancelAnimationFrame(frameId);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        ui.close.removeEventListener('click', closeLiebiGame);
        ui.exit.removeEventListener('click', closeLiebiGame);
        ui.restart.removeEventListener('click', restart);
        overlay.remove();
        liebiGameCleanup = null;
    }

    function restart() {
        cleanup();
        setTimeout(startLiebiGame, 60);
    }

    liebiGameCleanup = cleanup;
    ui.close.addEventListener('click', closeLiebiGame);
    ui.exit.addEventListener('click', closeLiebiGame);
    ui.restart.addEventListener('click', restart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    AudioEngine.bootBeep();
    setMessage('BLACKSITE BREACH SIMULATION STARTED', 1800);
    renderGame(performance.now());
    updateHud(true);
    frameId = requestAnimationFrame(gameLoop);
}

// ========================================
// SECRET MINI-GAME
// ========================================
function loadGameHighScores() {
    try {
        const storedScores = JSON.parse(localStorage.getItem('rocketGameScores') || '[]');
        return Array.isArray(storedScores) ? storedScores : [];
    } catch (error) {
        return [];
    }
}

function saveGameHighScores() {
    try {
        localStorage.setItem('rocketGameScores', JSON.stringify(gameHighScores));
    } catch (error) {}
}

function cleanScoreName(name) {
    return String(name || 'PILOT')
        .replace(/[^\w -]/g, '')
        .trim()
        .slice(0, 10)
        .toUpperCase() || 'PILOT';
}

let gameHighScores = loadGameHighScores();

function startMiniGame() {
    const overlay = document.createElement('div');
    overlay.id = 'gameOverlay';
    overlay.innerHTML = `
        <style>
            #gameOverlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #000; z-index: 500; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--terminal-font); }
            #gameCanvas { border: 2px solid #20c20e; box-shadow: 0 0 30px rgba(32, 194, 14, 0.5); }
            #gameUI { color: #20c20e; font-size: 20px; margin-bottom: 10px; width: 800px; display: flex; justify-content: space-between; }
            #gameTitle { color: #ffb000; font-size: 28px; margin-bottom: 20px; text-shadow: 0 0 10px rgba(255, 176, 0, 0.5); }
            #gameInstructions { color: #888; font-size: 16px; margin-top: 15px; }
            #leaderboard { position: absolute; right: 30px; top: 50%; transform: translateY(-50%); background: rgba(0, 20, 0, 0.8); border: 1px solid #20c20e; padding: 20px; color: #20c20e; min-width: 200px; }
            #leaderboard h3 { color: #ffb000; margin-bottom: 15px; text-align: center; }
            #leaderboard ol { padding-left: 25px; }
            #leaderboard li { margin: 8px 0; }
            .score-name { color: #00d4aa; }
            .score-value { color: #ffb000; float: right; }
            #gameOver { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.95); border: 2px solid #ffb000; padding: 40px; text-align: center; z-index: 10; }
            #gameOver h2 { color: #ffb000; font-size: 32px; margin-bottom: 20px; }
            #gameOver .final-score { color: #20c20e; font-size: 48px; margin: 20px 0; }
            #gameOver input { background: #0a0a15; border: 1px solid #20c20e; color: #20c20e; font-family: var(--terminal-font); font-size: 20px; padding: 10px 20px; margin: 10px; text-align: center; width: 200px; }
            #gameOver button { background: #20c20e; border: none; color: #000; font-family: var(--terminal-font); font-size: 18px; padding: 12px 30px; margin: 10px; cursor: pointer; }
            #gameOver button:hover { background: #39ff14; }
            #gameOver button.secondary { background: transparent; border: 1px solid #888; color: #888; }
        </style>
        <div id="gameTitle">◈ ROCKET COMMAND ◈</div>
        <div id="gameUI"><span>SCORE: <span id="scoreDisplay">0</span></span><span>TIME: <span id="timeDisplay">60</span>s</span></div>
        <canvas id="gameCanvas" width="800" height="500"></canvas>
        <div id="gameInstructions">↑/↓ or W/S to move | SPACE to fire | ESC to exit</div>
        <div id="leaderboard"><h3>◆ HIGH SCORES ◆</h3><ol id="scoreList"></ol></div>
        <div id="gameOver"><h2>MISSION COMPLETE</h2><div class="final-score" id="finalScore">0</div><p style="color: #888;">Enter your callsign:</p><input type="text" id="playerName" maxlength="10" placeholder="PILOT"><br><button onclick="submitScore()">SUBMIT SCORE</button><button class="secondary" onclick="closeGame()">EXIT</button></div>
    `;
    document.body.appendChild(overlay);
    updateLeaderboard();
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    
    let score = 0, timeLeft = 60, gameRunning = true, gameOver = false;
    const ship = { x: 80, y: H / 2, width: 50, height: 25, speed: 6 };
    let projectiles = [];
    const target = { x: W - 100, y: H / 2, radius: 35, innerRadius: 15, speedY: 3, direction: 1 };
    const stars = Array.from({length: 100}, () => ({ x: Math.random() * W, y: Math.random() * H, speed: 1 + Math.random() * 3, size: Math.random() * 2 }));
    const keys = {};
    let lastFire = 0;
    let gameFrame = null;
    
    function handleKeyDown(e) { keys[e.key] = true; if (e.key === ' ' && gameRunning && !gameOver) { e.preventDefault(); fireProjectile(); } if (e.key === 'Escape') closeGame(); }
    function handleKeyUp(e) { keys[e.key] = false; }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    function fireProjectile() {
        const now = Date.now();
        if (now - lastFire < 200) return;
        lastFire = now;
        projectiles.push({ x: ship.x + ship.width, y: ship.y, speed: 12, wave: 0 });
        if (AudioEngine.canPlay()) { const osc = AudioEngine.ctx.createOscillator(); const gain = AudioEngine.ctx.createGain(); osc.connect(gain); gain.connect(AudioEngine.destination()); osc.frequency.setValueAtTime(200, AudioEngine.ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, AudioEngine.ctx.currentTime + 0.1); osc.type = 'sine'; gain.gain.setValueAtTime(0.1, AudioEngine.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, AudioEngine.ctx.currentTime + 0.1); osc.start(); osc.stop(AudioEngine.ctx.currentTime + 0.1); }
    }
    
    function playHitSound() { if (AudioEngine.canPlay()) { [400, 600, 800].forEach((freq, i) => { setTimeout(() => { if (!AudioEngine.canPlay()) return; const osc = AudioEngine.ctx.createOscillator(); const gain = AudioEngine.ctx.createGain(); osc.connect(gain); gain.connect(AudioEngine.destination()); osc.frequency.value = freq; osc.type = 'sine'; gain.gain.setValueAtTime(0.08, AudioEngine.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, AudioEngine.ctx.currentTime + 0.1); osc.start(); osc.stop(AudioEngine.ctx.currentTime + 0.1); }, i * 50); }); } }
    
    function drawShip() {
        ctx.save(); ctx.translate(ship.x, ship.y);
        ctx.fillStyle = '#ff6b9d'; ctx.beginPath(); ctx.ellipse(0, 0, ship.width / 2, ship.height / 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff8fad'; ctx.beginPath(); ctx.arc(ship.width / 2 - 5, 0, ship.height / 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cc5580'; ctx.beginPath(); ctx.ellipse(-ship.width / 3, ship.height / 4, 8, 6, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-ship.width / 3, -ship.height / 4, 8, 6, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffb000'; ctx.beginPath(); ctx.moveTo(-ship.width / 2, -5); ctx.lineTo(-ship.width / 2 - 15 - Math.random() * 10, 0); ctx.lineTo(-ship.width / 2, 5); ctx.fill();
        ctx.restore();
    }
    
    function drawProjectile(p) {
        ctx.save(); ctx.translate(p.x, p.y);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0);
        for (let i = 1; i <= 20; i++) ctx.lineTo(-i * 1.5, Math.sin((p.wave + i) * 0.5) * 4);
        ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    
    function drawTarget() {
        ctx.save(); ctx.translate(target.x, target.y);
        ctx.fillStyle = '#ff69b4'; ctx.beginPath(); ctx.arc(0, 0, target.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, target.innerRadius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffb6c1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, target.radius - 5, -0.5, 1.5); ctx.stroke();
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 8; i++) { const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.001; const r = target.radius - 10; ctx.fillRect(Math.cos(angle) * r - 2, Math.sin(angle) * r - 2, 4, 4); }
        ctx.restore();
    }
    
    function update() {
        if (!gameRunning || gameOver) return;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) ship.y = Math.max(ship.height, ship.y - ship.speed);
        if (keys['ArrowDown'] || keys['s'] || keys['S']) ship.y = Math.min(H - ship.height, ship.y + ship.speed);
        target.y += target.speedY * target.direction;
        if (target.y < target.radius + 20 || target.y > H - target.radius - 20) target.direction *= -1;
        projectiles.forEach(p => { p.x += p.speed; p.wave += 0.3; });
        projectiles = projectiles.filter(p => p.x < W + 50);
        projectiles = projectiles.filter(p => {
            const dx = p.x - target.x, dy = p.y - target.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < target.radius && dist > target.innerRadius) {
                score += 10; document.getElementById('scoreDisplay').textContent = score; playHitSound();
                target.speedY = Math.min(8, target.speedY + 0.1);
                return false;
            }
            return true;
        });
        stars.forEach(s => { s.x -= s.speed; if (s.x < 0) { s.x = W; s.y = Math.random() * H; } });
    }
    
    function draw() {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#444'; stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); });
        ctx.strokeStyle = 'rgba(32, 194, 14, 0.1)'; ctx.lineWidth = 1;
        for (let i = 0; i < W; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
        for (let i = 0; i < H; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }
        drawTarget(); projectiles.forEach(p => drawProjectile(p)); drawShip();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; for (let i = 0; i < H; i += 2) ctx.fillRect(0, i, W, 1);
    }
    
    function gameLoop() { if (!document.getElementById('gameOverlay')) return; update(); draw(); if (gameRunning && !gameOver) gameFrame = requestAnimationFrame(gameLoop); }
    
    const timer = setInterval(() => {
        if (!gameRunning || gameOver) { clearInterval(timer); return; }
        timeLeft--; document.getElementById('timeDisplay').textContent = timeLeft;
        if (timeLeft <= 0) { gameOver = true; document.getElementById('finalScore').textContent = score; document.getElementById('gameOver').style.display = 'block'; document.getElementById('playerName').focus(); }
    }, 1000);
    
    gameLoop();
    
    window.submitScore = function() {
        const name = cleanScoreName(document.getElementById('playerName').value);
        gameHighScores.push({ name, score });
        gameHighScores.sort((a, b) => b.score - a.score);
        gameHighScores = gameHighScores.slice(0, 10);
        saveGameHighScores();
        updateLeaderboard();
        document.getElementById('gameOver').style.display = 'none';
        if (confirm('Score submitted! Play again?')) { closeGame(); setTimeout(() => startMiniGame(), 100); } else { closeGame(); }
    };
    
    window.closeGame = function() {
        gameRunning = false;
        clearInterval(timer);
        if (gameFrame) {
            cancelAnimationFrame(gameFrame);
            gameFrame = null;
        }
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        const overlay = document.getElementById('gameOverlay');
        if (overlay) overlay.remove();
    };
    
    function updateLeaderboard() {
        const list = document.getElementById('scoreList');
        if (!list) return;
        list.textContent = '';
        if (gameHighScores.length === 0) {
            const empty = document.createElement('li');
            empty.style.color = '#666';
            empty.textContent = 'No scores yet';
            list.appendChild(empty);
            return;
        }
        gameHighScores.forEach(scoreEntry => {
            const item = document.createElement('li');
            const name = document.createElement('span');
            const value = document.createElement('span');
            name.className = 'score-name';
            value.className = 'score-value';
            name.textContent = cleanScoreName(scoreEntry.name);
            value.textContent = String(Number(scoreEntry.score) || 0);
            item.appendChild(name);
            item.appendChild(value);
            list.appendChild(item);
        });
    }
}

// ========================================
// HOLOGRAM
// ========================================
function initHologram() {
    if (hologramStarted) return;
    const canvas = document.getElementById('hologramCanvas');
    if (!canvas) return;
    const panel = canvas.closest('.hologram-panel');
    if (!panel || getComputedStyle(panel).display === 'none') return;
    hologramStarted = true;
    
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let renderTimer = null;
    let pixelRatio = 1;
    let lastFrameTime = 0;

    function getHologramFrameMs() {
        if (prefersReducedMotion) return 250;
        return document.body.classList.contains('low-power') ? 66 : 33;
    }
    
    function resize() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            const targetWidth = Math.max(1, Math.round(rect.width * pixelRatio));
            const targetHeight = Math.max(1, Math.round(rect.height * pixelRatio));
            if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
                canvas.width = targetWidth;
                canvas.height = targetHeight;
            }
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            width = rect.width;
            height = rect.height;
        } else {
            width = 0;
            height = 0;
        }
    }
    resize();
    window.addEventListener('resize', resize);

    function queueHologramFrame(delay = getHologramFrameMs()) {
        if (renderTimer || !canvas.isConnected) return;
        renderTimer = setTimeout(() => {
            renderTimer = null;
            requestAnimationFrame(render);
        }, delay);
    }
    
    const facility = {
        rooms: [
            { x: -30, y: 0, z: -20, w: 60, h: 18, d: 40 },
            { x: -45, y: 0, z: -12, w: 15, h: 12, d: 24 },
            { x: 30, y: 0, z: -12, w: 15, h: 12, d: 24 },
            { x: -10, y: 18, z: -10, w: 20, h: 20, d: 20 },
            { x: -38, y: -10, z: -25, w: 76, h: 10, d: 50 }
        ],
        doors: [
            { x: -3, y: 0, z: 20, w: 6, h: 10 },
            { x: -30, y: 0, z: 0, w: 5, h: 8 },
            { x: 30, y: 0, z: 0, w: 5, h: 8 }
        ]
    };
    
    let angle = 0;
    
    function project(x, y, z, rot) {
        const cos = Math.cos(rot), sin = Math.sin(rot);
        const rx = x * cos - z * sin, rz = x * sin + z * cos;
        return { x: (rx - rz) * 0.8, y: (rx + rz) * 0.3 - y * 0.8 };
    }
    
    function drawBox(box, rot, color, alpha) {
        const { x, y, z, w, h, d } = box;
        const v = [[x,y,z],[x+w,y,z],[x+w,y,z+d],[x,y,z+d],[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]];
        const p = v.map(pt => project(pt[0], pt[1], pt[2], rot));
        const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        edges.forEach(([a,b]) => { ctx.moveTo(p[a].x, p[a].y); ctx.lineTo(p[b].x, p[b].y); });
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    function drawDoor(door, rot) {
        const { x, y, z, w, h } = door;
        const v = [[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]];
        const p = v.map(pt => project(pt[0], pt[1], pt[2], rot));
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 3;
        ctx.beginPath();
        p.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    function render(timestamp = 0) {
        if (!canvas.isConnected) return;
        if (!document.body.classList.contains('terminal-ready')) {
            lastFrameTime = 0;
            queueHologramFrame(600);
            return;
        }
        if (document.hidden) {
            lastFrameTime = 0;
            queueHologramFrame(600);
            return;
        }
        if (width <= 0 || height <= 0) {
            resize();
            lastFrameTime = 0;
            queueHologramFrame(600);
            return;
        }

        const delta = lastFrameTime ? Math.min(66, timestamp - lastFrameTime) : getHologramFrameMs();
        lastFrameTime = timestamp;
        
        ctx.fillStyle = 'rgba(3, 10, 3, 0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2 + 10);
        
        // Grid
        ctx.strokeStyle = '#20c20e';
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        for (let i = -3; i <= 3; i++) {
            let p1 = project(i * 12, -10, -36, angle), p2 = project(i * 12, -10, 36, angle);
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            let p3 = project(-36, -10, i * 12, angle), p4 = project(36, -10, i * 12, angle);
            ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Facility
        ctx.shadowColor = '#20c20e';
        ctx.shadowBlur = 2;
        facility.rooms.forEach((room, i) => drawBox(room, angle, '#20c20e', i === 4 ? 0.2 : 0.4));
        facility.doors.forEach(door => drawDoor(door, angle));
        ctx.restore();
        
        // Scan line
        if (height > 0) {
            const scanY = prefersReducedMotion ? height * 0.55 : (timestamp * 0.035) % height;
            if (isFinite(scanY) && scanY >= 0) {
                const grad = ctx.createLinearGradient(0, Math.max(0, scanY - 8), 0, scanY + 8);
                grad.addColorStop(0, 'rgba(32,194,14,0)');
                grad.addColorStop(0.5, 'rgba(32,194,14,0.12)');
                grad.addColorStop(1, 'rgba(32,194,14,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, scanY - 8, width, 16);
            }
        }
        
        if (prefersReducedMotion) return;

        angle += 0.0038 * (delta / 16.7);
        queueHologramFrame();
    }
    
    queueHologramFrame(100);
}

// ========================================
// CASINO GAME - DER FETTE
// ========================================
function startCasinoGame() {
    var overlay = document.createElement('div');
    overlay.id = 'casinoOverlay';
    overlay.innerHTML = '<style>' +
        '#casinoOverlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #0a0a0a; z-index: 500; display: flex; font-family: var(--terminal-font); color: #20c20e; }' +
        '.casino-left { flex: 2; display: flex; flex-direction: column; padding: 20px; border-right: 2px solid #20c20e; }' +
        '.casino-right { flex: 1; display: flex; flex-direction: column; padding: 20px; align-items: center; }' +
        '.casino-title { text-align: center; font-size: 28px; color: #ffb000; text-shadow: 0 0 10px #ffb000; margin-bottom: 10px; }' +
        '.casino-subtitle { text-align: center; font-size: 14px; color: #666; margin-bottom: 20px; }' +
        '.slot-machine { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }' +
        '.slot-frame { border: 3px solid #ffb000; padding: 20px; background: rgba(0, 20, 0, 0.5); box-shadow: 0 0 30px rgba(255, 176, 0, 0.3), inset 0 0 50px rgba(0,0,0,0.5); }' +
        '.slot-reels { display: flex; gap: 10px; margin-bottom: 20px; }' +
        '.slot-reel { width: 100px; height: 180px; border: 2px solid #20c20e; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; overflow: hidden; position: relative; }' +
        '.reel-symbol { white-space: pre; line-height: 1.1; text-align: center; padding: 5px; }' +
        '.slot-info { display: flex; justify-content: space-between; width: 100%; margin-bottom: 15px; font-size: 18px; }' +
        '.credits { color: #00d4aa; } .bet { color: #ffb000; }' +
        '.win-display { text-align: center; font-size: 24px; color: #ff3333; height: 30px; text-shadow: 0 0 10px #ff3333; }' +
        '.slot-buttons { display: flex; gap: 10px; margin-top: 15px; }' +
        '.slot-btn { padding: 15px 30px; font-family: var(--terminal-font); font-size: 18px; border: 2px solid; background: rgba(0, 30, 0, 0.8); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; }' +
        '.slot-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 0 15px currentColor; }' +
        '.slot-btn:disabled { opacity: 0.5; cursor: not-allowed; }' +
        '.slot-btn.spin { color: #20c20e; border-color: #20c20e; }' +
        '.slot-btn.bet-btn { color: #ffb000; border-color: #ffb000; }' +
        '.slot-btn.exit { color: #ff3333; border-color: #ff3333; }' +
        '.paytable { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }' +
        '.paytable-title { color: #ffb000; margin-bottom: 5px; }' +
        '.jackpot-display { font-size: 20px; color: #ff00ff; text-shadow: 0 0 15px #ff00ff; margin-bottom: 10px; animation: jackpotPulse 1s ease-in-out infinite; }' +
        '@keyframes jackpotPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }' +
        '.orc-container { flex: 1; display: flex; flex-direction: column; align-items: center; }' +
        '.orc-title { color: #ff3333; font-size: 18px; margin-bottom: 10px; }' +
        '.orc-portrait { white-space: pre; font-size: 10px; line-height: 1.0; color: #20c20e; margin-bottom: 15px; }' +
        '.speech-bubble { background: rgba(0, 30, 0, 0.8); border: 2px solid #ff3333; border-radius: 10px; padding: 15px; max-width: 280px; position: relative; margin-top: 10px; }' +
        '.speech-bubble::before { content: ""; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 10px solid #ff3333; }' +
        '.speech-text { color: #ff3333; font-size: 14px; text-align: center; min-height: 60px; }' +
        '.casino-instructions { color: #444; font-size: 12px; text-align: center; margin-top: auto; }' +
        '.winning { animation: winFlash 0.3s ease-in-out 5; }' +
        '@keyframes winFlash { 0%, 100% { background: rgba(0, 50, 0, 0.5); } 50% { background: rgba(255, 176, 0, 0.3); } }' +
        '</style>' +
        '<div class="casino-left">' +
        '<div class="casino-title">★ SHADOWRUN SLOTS ★</div>' +
        '<div class="casino-subtitle">Der Fette\'s Lucky Machine</div>' +
        '<div class="slot-machine">' +
        '<div class="jackpot-display">◆ JACKPOT: <span id="jackpotAmount">10000</span>¥ ◆</div>' +
        '<div class="slot-frame">' +
        '<div class="slot-info"><span class="credits">CREDITS: <span id="creditDisplay">1000</span>¥</span><span class="bet">BET: <span id="betDisplay">10</span>¥</span></div>' +
        '<div class="slot-reels"><div class="slot-reel" id="reel1"><div class="reel-symbol"></div></div><div class="slot-reel" id="reel2"><div class="reel-symbol"></div></div><div class="slot-reel" id="reel3"><div class="reel-symbol"></div></div></div>' +
        '<div class="win-display" id="winDisplay"></div>' +
        '<div class="slot-buttons"><button class="slot-btn bet-btn" id="betBtn">BET +10</button><button class="slot-btn spin" id="spinBtn">◆ SPIN ◆</button><button class="slot-btn exit" onclick="closeCasino()">EXIT</button></div>' +
        '</div>' +
        '<div class="paytable"><div class="paytable-title">═══ PAYOUTS ═══</div><div>DRAGON x3 = JACKPOT! | SKULL x3 = 50x</div><div>GHOST x3 = 25x | GUN x3 = 15x</div><div>STIM x3 = 10x | NUYEN x3 = 8x</div><div>DICE x3 = 5x | Any 2 Match = 2x</div></div>' +
        '</div></div>' +
        '<div class="casino-right"><div class="orc-container"><div class="orc-title">◆ DER FETTE ◆</div><div class="orc-portrait" id="orcPortrait"></div><div class="speech-bubble"><div class="speech-text" id="orcSpeech">Step right up, chummer! Let\'s see what you got...</div></div></div><div class="casino-instructions">SPACE = Spin | +/- = Change Bet | ESC = Exit</div></div>';
    document.body.appendChild(overlay);
    
    // Game state
    var credits = 1000;
    var bet = 10;
    var jackpot = 10000;
    var spinning = false;
    
    // Symbols with ASCII art
    var symbols = [
        { name: 'dragon', weight: 2, art: "  /\\_/\\\n ( o.o )\n  > ^ <\n /|   |\\\n/_|   |_\\\nDRAGON" },
        { name: 'skull', weight: 4, art: "  ___\n /o o\\\n \\ - /\n  |||\n /|||\\\n SKULL" },
        { name: 'ghost', weight: 6, art: "  .-.\n (o o)\n | O |\n |   |\n '~~~'\n GHOST" },
        { name: 'gun', weight: 8, art: "    _\n  _/ |\n |__/|\n    ||\n   _||_\n  ARES" },
        { name: 'stim', weight: 10, art: "  ___\n |[+]|\n |   |\n |___|\n   |\n STIM" },
        { name: 'nuyen', weight: 12, art: "  ___\n /   \\\n| ¥¥¥ |\n \\___/\n  |||\n NUYEN" },
        { name: 'dice', weight: 15, art: " .---.\n/o   |\n|  o |\n|   o/\n'---'\n DICE" },
        { name: 'chip', weight: 18, art: "  ___\n [|||]\n |CPU|\n [|||]\n  ---\n CHIP" }
    ];
    
    // Build weighted array
    var weightedSymbols = [];
    symbols.forEach(function(s) {
        for (var i = 0; i < s.weight; i++) weightedSymbols.push(s);
    });
    
    // Orc ASCII portrait frames
    var orcFrames = [
        "      ,---.\n     /o   o\\\n    |   _   |\n   /| (___) |\\\n  / |       | \\\n |  |~~---~~|  |\n |  | |\\/| |  |\n/___|_|  |_|___\\\n|    BOSS    |\n|   \\\\__//   |\n'----'  '----'",
        "      ,---.\n     /o   o\\\n    |  \\_/  |\n   /| (___) |\\\n  / |       | \\\n |  |~~---~~|  |\n |  | |\\/| |  |\n/___|_|  |_|___\\\n|    BOSS    |\n|   \\\\__//   |\n'----'  '----'",
        "      ,---.\n     /-   o\\\n    |   _   |\n   /| (___) |\\\n  / |       | \\\n |  |~~---~~|  |\n |  | |\\/| |  |\n/___|_|  |_|___\\\n|    BOSS    |\n|   \\\\__//   |\n'----'  '----'"
    ];
    
    // 150 Shadowrun-themed insults
    var insults = [
        "Another day, another sucker loses their nuyen to Der Fette!",
        "You call that luck? I've seen better odds in a toxic spirit's lair!",
        "Keep spinning, chummer. My credstick needs padding!",
        "That's the spirit! The spirit of LOSING!",
        "Your dice rolling is almost as bad as your life choices!",
        "I've seen ghouls with better luck than you!",
        "Maybe try a different career, like being a speed bump!",
        "The house always wins, and I AM the house, omae!",
        "Your nuyen is crying tears of joy... in MY pocket!",
        "Even a technomancer couldn't compile luck this bad!",
        "You're making me rich! Well, richer!",
        "That spin was sadder than a wet troll in winter!",
        "Keep those credits flowing, like blood from a runner!",
        "Your luck stat must be in the negatives!",
        "I've seen better outcomes in BTL nightmares!",
        "The shadows are laughing at you, chummer!",
        "Another donation to the Fat One's retirement fund!",
        "You gamble like a corp exec manages - POORLY!",
        "Is that sweat or just the smell of defeat?",
        "My grandma slots better, and she's been dead 20 years!",
        "You're the reason casinos exist!",
        "That sound? It's your credstick weeping!",
        "Even Aztechnology couldn't sacrifice enough for your luck!",
        "I'm going to name my yacht after you... 'The Sucker'!",
        "Your spins are worse than DocWagon response times!",
        "I've seen better luck from a cursed artifact!",
        "Keep going! My third mansion won't buy itself!",
        "You must have pissed off every luck spirit in Seattle!",
        "That was beautiful... beautifully bad!",
        "The algorithm thanks you for your generous donation!",
        "Even riggers crash less than your luck!",
        "Your karma must be in the toilet!",
        "I'm laughing all the way to the offshore account!",
        "Maybe stick to your day job... if you have one!",
        "That spin had the grace of a drunk troll!",
        "You're funding my next chrome upgrade!",
        "The Matrix has seen your luck... it's embarrassed!",
        "You fight like you gamble - badly!",
        "Every spin brings me closer to that island!",
        "Your luck's flatter than a pancake in a press!",
        "I've seen wage slaves with more luck!",
        "That was almost as sad as corporate middle management!",
        "You're the gift that keeps on giving... TO ME!",
        "The spirits of fortune have abandoned you completely!",
        "Even a newbie decker has better luck!",
        "My credstick is getting fat, like me!",
        "You should have stayed in the barrens!",
        "That spin was rougher than Redmond streets!",
        "Your luck called - it's not coming back!",
        "I've seen ghouls luckier at finding meat!",
        "The shadows reject your gambling attempts!",
        "You're making my accountant very happy!",
        "Even toxic shamans have better fortune!",
        "That was pathetic, and I love it!",
        "Your nuyen is now MY nuyen, chummer!",
        "I've seen deckers brick with more style!",
        "The house doesn't just win, it DOMINATES!",
        "Your grandmother gambles better, from her grave!",
        "That spin was deader than a ghoul's lunch!",
        "Even Knight Errant couldn't protect your credits!",
        "You must really hate money!",
        "The only jackpot you'll hit is POVERTY!",
        "I'm going to frame this losing streak!",
        "Your luck is so bad, it's almost impressive!",
        "Even bug spirits wouldn't possess that luck!",
        "Keep it up! My kids need college funds!",
        "That spin was colder than an ice mage's heart!",
        "You gamble like Lone Star investigates - terribly!",
        "The odds weren't in your favor... obviously!",
        "Even a blind troll could do better!",
        "Your luck's worse than a runner's retirement plan!",
        "I'm getting fatter just watching you lose!",
        "That was embarrassing, even for you!",
        "The machine laughs at your misfortune!",
        "You couldn't win if the game was rigged FOR you!",
        "Even magical luck couldn't save those spins!",
        "Your credits are migrating to a better home - MINE!",
        "I've seen better luck in a cursed corp building!",
        "The only thing you're winning is my respect... for losing!",
        "You should take up a safer hobby, like grenade juggling!",
        "Even a street sam with no cyber would do better!",
        "Your luck is an endangered species... extinct!",
        "That spin was sadder than a troll's love life!",
        "Keep donating to the Church of Der Fette!",
        "I'm composing a symphony called 'Your Failure'!",
        "You're the reason I can afford real krill!",
        "That was worse than getting caught by DocWagon debt collectors!",
        "Your luck is so bad, fixers won't work with you!",
        "Even a Chicago runner has better odds!",
        "I've seen mages geek themselves with more dignity!",
        "The algorithm REALLY doesn't like you!",
        "You couldn't hit a jackpot with a targeting laser!",
        "Your spinning technique needs... everything!",
        "Even sewer-dwelling ghouls have more luck!",
        "That spin was rougher than BTL withdrawal!",
        "I love watching dreams die, one spin at a time!",
        "Your credstick is thinner than a rigger's patience!",
        "Even corp security shoots better than you gamble!",
        "The machine hungers for your failure... NOM NOM!",
        "You're like a wage slave, but less lucky!",
        "That was beautiful... if you're a masochist!",
        "Your karma debt must be astronomical!",
        "Even toxic waste has better vibes than your luck!",
        "I'm going to build a statue with your lost nuyen!",
        "You gamble like a trog dances - clumsily!",
        "The spirits whisper 'loser' when you spin!",
        "Your luck couldn't power a dead commlink!",
        "Even extracted scientists have more freedom than your luck!",
        "That spin was deader than old Seattle!",
        "Keep going, my personal zoo needs exotic animals!",
        "You couldn't win with loaded dice!",
        "Your luck is like a decker without a deck - USELESS!",
        "Even Halloweeners have better aim than your luck!",
        "The machine feeds on your tears!",
        "You're funding my solid gold toilet!",
        "That was worse than a milk run gone wrong!",
        "Your luck stat is a cautionary tale!",
        "Even go-gangers crash less than your hopes!",
        "I've seen corpse caddies with more vitality!",
        "The only run you're completing is running out of credits!",
        "Your spins are like drek... awful!",
        "Even a BTL addict has better decision making!",
        "Keep it up, my retirement planet won't buy itself!",
        "You gamble like a newbie with no fixer!",
        "That spin was sadder than a squatter's life!",
        "Your luck died harder than cyberzombies!",
        "Even blood mages sacrifice less than you!",
        "The machine demands more sacrifice!",
        "You're making history... in LOSING!",
        "Your luck couldn't jumpstart a dead credstick!",
        "Even pixies have more substance than your luck!",
        "That was rougher than a bunraku parlor!",
        "I'm writing my memoirs: 'How Suckers Made Me Rich'!",
        "Your gambling is worse than your fashion sense!",
        "Even infected runners have better survival odds!",
        "The only extraction happening is of your nuyen!",
        "You couldn't win if Lady Luck was your fixer!",
        "Your spins are making spirits weep!",
        "Even a dragon's hoard isn't growing as fast as mine!",
        "That was more tragic than a failed run!",
        "Your luck is the real cautionary tale!",
        "Even megacorp lawyers have more soul than your luck!",
        "I'm laughing so hard, my tusks hurt!",
        "The machine has spoken: YOU LOSE!",
        "Your credits are in a better place now... MY POCKET!",
        "You gamble like you've never seen nuyen before!",
        "Even CFD victims have better coordination!",
        "That spin was smoother than sandpaper!",
        "Keep going! I need to gild my bathroom!",
        "Your luck is an urban legend of failure!",
        "Even tempo addicts have better highs than your wins!"
    ];
    
    // Initialize orc
    var orcPortrait = document.getElementById('orcPortrait');
    var orcFrame = 0;
    var orcTimer = null;
    orcPortrait.textContent = orcFrames[0];
    
    // Animate orc
    orcTimer = setInterval(function() {
        orcFrame = (orcFrame + 1) % orcFrames.length;
        if (orcPortrait) orcPortrait.textContent = orcFrames[orcFrame];
    }, 500);
    
    // Initialize reels
    var reels = [
        document.getElementById('reel1').querySelector('.reel-symbol'),
        document.getElementById('reel2').querySelector('.reel-symbol'),
        document.getElementById('reel3').querySelector('.reel-symbol')
    ];
    
    var results = [
        weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)],
        weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)],
        weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)]
    ];
    
    reels.forEach(function(reel, i) {
        reel.textContent = results[i].art;
        reel.style.color = '#20c20e';
    });
    
    function updateDisplays() {
        document.getElementById('creditDisplay').textContent = credits;
        document.getElementById('betDisplay').textContent = bet;
        document.getElementById('jackpotAmount').textContent = jackpot;
    }
    
    function getInsult() {
        return insults[Math.floor(Math.random() * insults.length)];
    }
    
    function showOrcMessage(msg) {
        document.getElementById('orcSpeech').textContent = msg;
    }
    
    async function spin() {
        if (spinning || credits < bet) {
            if (credits < bet) {
                showOrcMessage("HAHAHAHA! You're BROKE! Get out of my casino, you pathetic worm!");
            }
            return;
        }
        
        spinning = true;
        credits -= bet;
        jackpot += Math.floor(bet * 0.1);
        updateDisplays();
        document.getElementById('winDisplay').textContent = '';
        document.getElementById('spinBtn').disabled = true;
        
        // Play spin sound
        if (AudioEngine.canPlay()) {
            for (var i = 0; i < 10; i++) {
                (function(idx) {
                    setTimeout(function() {
                        if (!AudioEngine.canPlay()) return;
                        var osc = AudioEngine.ctx.createOscillator();
                        var gain = AudioEngine.ctx.createGain();
                        osc.connect(gain);
                        gain.connect(AudioEngine.destination());
                        osc.frequency.value = 100 + Math.random() * 300;
                        osc.type = 'square';
                        gain.gain.setValueAtTime(0.05, AudioEngine.ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, AudioEngine.ctx.currentTime + 0.05);
                        osc.start();
                        osc.stop(AudioEngine.ctx.currentTime + 0.05);
                    }, idx * 50);
                })(i);
            }
        }
        
        // Spin animation for each reel
        var finalResults = [];
        for (var r = 0; r < 3; r++) {
            var reel = reels[r];
            var spins = 10 + r * 5;
            
            for (var s = 0; s < spins; s++) {
                await new Promise(function(resolve) { setTimeout(resolve, 50 + s * 5); });
                var randomSym = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
                reel.textContent = randomSym.art;
                reel.style.color = '#20c20e';
            }
            
            var finalSym = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
            finalResults.push(finalSym);
            reel.textContent = finalSym.art;
            
            if (AudioEngine.canPlay()) {
                var osc = AudioEngine.ctx.createOscillator();
                var gain = AudioEngine.ctx.createGain();
                osc.connect(gain);
                gain.connect(AudioEngine.destination());
                osc.frequency.value = 150;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.1, AudioEngine.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, AudioEngine.ctx.currentTime + 0.1);
                osc.start();
                osc.stop(AudioEngine.ctx.currentTime + 0.1);
            }
        }
        
        // Check results
        var names = finalResults.map(function(s) { return s.name; });
        var winAmount = 0;
        var winMsg = '';
        
        if (names[0] === names[1] && names[1] === names[2]) {
            switch(names[0]) {
                case 'dragon':
                    winAmount = jackpot;
                    winMsg = '★★★ JACKPOT!!! ★★★';
                    showOrcMessage("IMPOSSIBLE! THE JACKPOT?! You... you... THIS MACHINE IS BROKEN!");
                    jackpot = 10000;
                    break;
                case 'skull':
                    winAmount = bet * 50;
                    winMsg = '☠☠☠ TRIPLE SKULLS! 50x ☠☠☠';
                    showOrcMessage("Skulls?! You got lucky, punk! Don't let it go to your empty head!");
                    break;
                case 'ghost':
                    winAmount = bet * 25;
                    winMsg = 'TRIPLE GHOSTS! 25x';
                    showOrcMessage("Ghosts... fitting for someone who's about to be financially dead!");
                    break;
                case 'gun':
                    winAmount = bet * 15;
                    winMsg = 'TRIPLE ARES! 15x';
                    showOrcMessage("Armed and slightly less poor! Don't get cocky!");
                    break;
                case 'stim':
                    winAmount = bet * 10;
                    winMsg = 'TRIPLE STIMS! 10x';
                    showOrcMessage("Stims! You'll need them after I'm done with your wallet!");
                    break;
                case 'nuyen':
                    winAmount = bet * 8;
                    winMsg = 'TRIPLE NUYEN! 8x';
                    showOrcMessage("Some nuyen back... temporary setback for Der Fette!");
                    break;
                case 'dice':
                    winAmount = bet * 5;
                    winMsg = 'TRIPLE DICE! 5x';
                    showOrcMessage("Lucky dice! But luck always runs out, chummer!");
                    break;
                case 'chip':
                    winAmount = bet * 3;
                    winMsg = 'TRIPLE CHIPS! 3x';
                    showOrcMessage("Chips! Barely worth my time, but enjoy your crumbs!");
                    break;
            }
            reels.forEach(function(r) { r.parentElement.classList.add('winning'); });
            setTimeout(function() { reels.forEach(function(r) { r.parentElement.classList.remove('winning'); }); }, 1500);
        } else if (names[0] === names[1] || names[1] === names[2] || names[0] === names[2]) {
            winAmount = bet * 2;
            winMsg = 'PAIR! 2x';
            showOrcMessage(getInsult());
        } else {
            showOrcMessage(getInsult());
        }
        
        if (winAmount > 0) {
            credits += winAmount;
            document.getElementById('winDisplay').textContent = winMsg + ' +' + winAmount + ' nuyen';
            if (AudioEngine.canPlay()) {
                [200, 300, 400, 500].forEach(function(freq, i) {
                    setTimeout(function() {
                        if (!AudioEngine.canPlay()) return;
                        var osc = AudioEngine.ctx.createOscillator();
                        var gain = AudioEngine.ctx.createGain();
                        osc.connect(gain);
                        gain.connect(AudioEngine.destination());
                        osc.frequency.value = freq;
                        osc.type = 'sine';
                        gain.gain.setValueAtTime(0.1, AudioEngine.ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, AudioEngine.ctx.currentTime + 0.15);
                        osc.start();
                        osc.stop(AudioEngine.ctx.currentTime + 0.15);
                    }, i * 100);
                });
            }
        }
        
        updateDisplays();
        spinning = false;
        document.getElementById('spinBtn').disabled = false;
    }
    
    function changeBet(delta) {
        bet = Math.max(10, Math.min(100, bet + delta));
        updateDisplays();
    }
    
    document.getElementById('spinBtn').addEventListener('click', spin);
    document.getElementById('betBtn').addEventListener('click', function() { changeBet(10); });
    
    function handleCasinoKeys(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            spin();
        } else if (e.key === '+' || e.key === '=') {
            changeBet(10);
        } else if (e.key === '-' || e.key === '_') {
            changeBet(-10);
        } else if (e.key === 'Escape') {
            closeCasino();
        }
    }
    
    document.addEventListener('keydown', handleCasinoKeys);
    
    window.closeCasino = function() {
        document.removeEventListener('keydown', handleCasinoKeys);
        if (orcTimer) {
            clearInterval(orcTimer);
            orcTimer = null;
        }
        var overlay = document.getElementById('casinoOverlay');
        if (overlay) overlay.remove();
    };
    
    updateDisplays();
}
