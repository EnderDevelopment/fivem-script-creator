const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const loadingLabel = document.getElementById('loading-label');
const tipText = document.getElementById('tip-text');
const tips = [
    'Tip: Every decision has a consequence.',
    'Tip: Use your phone to meet people and find work.',
    'Tip: Respect the roleplay and let every scene unfold.',
    'Tip: The city rewards patience, teamwork, and good stories.'
];
let currentTip = 0;
let progress = 0;
let audioContext = null;
let masterGain = null;
let oscillator = null;
let playing = false;
let trackIndex = 0;
const tracks = [
    { title: 'MIDNIGHT DRIVE', frequency: 55 },
    { title: 'NEON RAIN', frequency: 65.41 },
    { title: 'AFTER HOURS', frequency: 49 }
];

function setProgress(value) {
    const next = Math.max(progress, Math.min(1, Number(value) || 0));
    progress = next;
    const percent = Math.round(next * 100);
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
    if (percent >= 100) loadingLabel.textContent = 'ENTERING SHADOW CITY';
}

window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type === 'progress') setProgress(data.value);
    if (data.eventName === 'loadProgress' && typeof data.loadFraction === 'number') {
        setProgress(data.loadFraction);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    fetch(`https://${GetParentResourceName()}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    }).catch(() => {});
});

window.setInterval(() => {
    currentTip = (currentTip + 1) % tips.length;
    tipText.textContent = tips[currentTip];
}, 6000);

const panelData = {
    team: {
        kicker: 'THE PEOPLE BEHIND THE CITY',
        title: 'CITY TEAM',
        body: '<p>Our staff team keeps Shadow City fair, welcoming, and running smoothly.</p><ul><li>Community Management</li><li>Server Moderation</li><li>Support Team</li></ul><p>Need help? Open a support ticket in our Discord.</p>'
    },
    rules: {
        kicker: 'PLAY FAIR. BUILD STORIES.',
        title: 'CITY RULES',
        body: '<ul><li>Respect every player and keep interactions in character.</li><li>No cheating, exploiting, harassment, or metagaming.</li><li>Value your character\'s life and give scenes room to develop.</li><li>Follow staff instructions and use Discord for support.</li></ul><p>See the Discord for the complete server rules.</p>'
    }
};

const overlay = document.getElementById('panel-overlay');
document.querySelectorAll('[data-panel]').forEach((button) => {
    button.addEventListener('click', () => {
        const panel = panelData[button.dataset.panel];
        if (!panel) return;
        document.getElementById('panel-kicker').textContent = panel.kicker;
        document.getElementById('panel-title').textContent = panel.title;
        document.getElementById('panel-content').innerHTML = panel.body;
        overlay.hidden = false;
    });
});

document.getElementById('close-panel').addEventListener('click', () => { overlay.hidden = true; });
overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.hidden = true;
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') overlay.hidden = true;
});

function startAmbient() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) {
        audioContext = new AudioContextClass();
        masterGain = audioContext.createGain();
        masterGain.gain.value = Number(document.getElementById('volume').value) * 0.12;
        masterGain.connect(audioContext.destination);
    }
    audioContext.resume();
    if (oscillator) oscillator.stop();
    oscillator = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const overtone = audioContext.createOscillator();
    const overtoneGain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = tracks[trackIndex].frequency;
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    overtone.type = 'triangle';
    overtone.frequency.value = tracks[trackIndex].frequency * 2;
    overtoneGain.gain.value = 0.13;
    oscillator.connect(filter);
    filter.connect(masterGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(masterGain);
    oscillator.start();
    overtone.start();
    playing = true;
    document.getElementById('music-toggle').textContent = 'Ⅱ';
    document.getElementById('music-toggle').setAttribute('aria-label', 'Pause ambient audio');
}

function stopAmbient() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
    playing = false;
    document.getElementById('music-toggle').textContent = '▶';
    document.getElementById('music-toggle').setAttribute('aria-label', 'Play ambient audio');
}

document.getElementById('music-toggle').addEventListener('click', () => {
    if (playing) stopAmbient();
    else startAmbient();
});

document.getElementById('next-track').addEventListener('click', () => {
    trackIndex = (trackIndex + 1) % tracks.length;
    document.getElementById('track-title').textContent = tracks[trackIndex].title;
    if (playing) startAmbient();
});

document.getElementById('volume').addEventListener('input', (event) => {
    if (masterGain) masterGain.gain.setTargetAtTime(Number(event.target.value) * 0.12, audioContext.currentTime, 0.04);
});
