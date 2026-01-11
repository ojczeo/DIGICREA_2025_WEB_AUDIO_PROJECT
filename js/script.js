window.onload = init;

let con, osc, square_osc, lfoSystem, lfo_amp, lpf, hpf, delay, reverb, distortion, osc1Gain, osc2Gain;
let lfoSystem2;
let mouseEnabled = false;
let keyboardEnabled = false;

const PRESETS_KEY = 'audioPresets';

function savePreset() {
    const presetName = document.getElementById('presetName').value.trim();
    if (!presetName) {
        alert('Please enter a preset name');
        return;
    }

    const preset = {
        name: presetName,
        // Oscillator 1
        osc1Type: document.getElementById('osc1Type').value,
        osc1Freq: parseFloat(document.getElementById('firstOscInput').value),
        osc1Enabled: document.getElementById('osc1Toggle').checked,
        lfo1Enabled: document.getElementById('lfoToggle').checked,
        lfo1Freq: parseFloat(document.getElementById('lfoFreqInput').value),
        // Oscillator 2
        osc2Type: document.getElementById('osc2Type').value,
        osc2Freq: parseFloat(document.getElementById('squareOscInput').value),
        osc2Enabled: document.getElementById('osc2Toggle').checked,
        lfo2Enabled: document.getElementById('lfo2Toggle').checked,
        lfo2Freq: parseFloat(document.getElementById('lfoFreq2Input').value),
        // Filters
        hpfFreq: parseFloat(document.getElementById('HPFinput').value),
        lpfFreq: parseFloat(document.getElementById('LPFinput').value),
        // Effects
        distortionEnabled: document.getElementById('distortionToggle').checked,
        distortionLevel: parseFloat(document.getElementById('distortionLevelInput').value),
        delayEnabled: document.getElementById('delayToggle').checked,
        delayTime: parseFloat(document.getElementById('delayTimeInput').value),
        delayFeedback: parseFloat(document.getElementById('delayFeedbackInput').value),
        reverbEnabled: document.getElementById('reverbToggle').checked,
        reverbMix: parseFloat(document.getElementById('reverbMixInput').value),
        // Other
        mouseEnabled: document.getElementById('mouseToggle').checked,
        keyboardEnabled: document.getElementById('keyboardToggle').checked,
        masterLevel: parseFloat(document.getElementById('masterLevelInput').value)
    };

    let presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    presets[presetName] = preset;
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));

    document.getElementById('presetName').value = '';
    updatePresetSelect();
    alert(`Preset "${presetName}" saved!`);
}

function loadPreset() {
    const presetSelect = document.getElementById('presetSelect');
    const presetName = presetSelect.value;
    
    if (!presetName) return;

    let presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    const preset = presets[presetName];
    
    if (!preset) {
        alert('Preset not found');
        return;
    }

    // Apply oscillator 1
    document.getElementById('osc1Type').value = preset.osc1Type;
    osc.type = preset.osc1Type;
    document.getElementById('firstOscInput').value = preset.osc1Freq;
    osc.frequency.value = preset.osc1Freq;
    document.getElementById('osc1Toggle').checked = preset.osc1Enabled;
    osc1Gain.gain.value = preset.osc1Enabled ? 1 : 0;
    document.getElementById('lfoToggle').checked = preset.lfo1Enabled;
    lfoSystem.gainNode.gain.value = preset.lfo1Enabled ? 100 : 0;
    document.getElementById('lfoFreqInput').value = preset.lfo1Freq;
    lfoSystem.oscillator.frequency.value = preset.lfo1Freq;

    // Apply oscillator 2
    document.getElementById('osc2Type').value = preset.osc2Type;
    square_osc.type = preset.osc2Type;
    document.getElementById('squareOscInput').value = preset.osc2Freq;
    square_osc.frequency.value = preset.osc2Freq;
    document.getElementById('osc2Toggle').checked = preset.osc2Enabled;
    osc2Gain.gain.value = preset.osc2Enabled ? 1 : 0;
    document.getElementById('lfo2Toggle').checked = preset.lfo2Enabled;
    lfoSystem2.gainNode.gain.value = preset.lfo2Enabled ? 100 : 0;
    document.getElementById('lfoFreq2Input').value = preset.lfo2Freq;
    lfoSystem2.oscillator.frequency.value = preset.lfo2Freq;

    // Apply filters
    document.getElementById('HPFinput').value = preset.hpfFreq;
    hpf.frequency.value = preset.hpfFreq;
    document.getElementById('LPFinput').value = preset.lpfFreq;
    lpf.frequency.value = preset.lpfFreq;

    // Apply effects
    document.getElementById('distortionToggle').checked = preset.distortionEnabled;
    if (preset.distortionEnabled) {
        distortionGain.wet.gain.value = 1;
        distortionGain.dry.gain.value = 0;
    } else {
        distortionGain.wet.gain.value = 0;
        distortionGain.dry.gain.value = 1;
    }
    document.getElementById('distortionLevelInput').value = preset.distortionLevel;
    updateDistortionCurve(preset.distortionLevel);

    document.getElementById('delayToggle').checked = preset.delayEnabled;
    if (preset.delayEnabled) {
        delayGain.wet.gain.value = 1;
        delayGain.dry.gain.value = 0;
    } else {
        delayGain.wet.gain.value = 0;
        delayGain.dry.gain.value = 1;
    }
    document.getElementById('delayTimeInput').value = preset.delayTime;
    delay.delayNode.delayTime.value = preset.delayTime;
    document.getElementById('delayFeedbackInput').value = preset.delayFeedback;
    delay.feedbackGain.gain.value = preset.delayFeedback;

    document.getElementById('reverbToggle').checked = preset.reverbEnabled;
    if (preset.reverbEnabled) {
        reverbGain.wet.gain.value = 1;
        reverbGain.dry.gain.value = 0;
    } else {
        reverbGain.wet.gain.value = 0;
        reverbGain.dry.gain.value = 1;
    }
    document.getElementById('reverbMixInput').value = preset.reverbMix;
    reverb.wetGain.gain.value = preset.reverbMix;
    reverb.dryGain.gain.value = 1 - preset.reverbMix;

    // Apply other settings
    document.getElementById('mouseToggle').checked = preset.mouseEnabled;
    mouseEnabled = preset.mouseEnabled;
    document.getElementById('keyboardToggle').checked = preset.keyboardEnabled || false;
    keyboardEnabled = preset.keyboardEnabled || false;
    
    // Apply master level
    const masterLevel = preset.masterLevel !== undefined ? preset.masterLevel : 0.5;
    document.getElementById('masterLevelInput').value = masterLevel;
    masterGain.gain.value = masterLevel;

    updateDisplay();
    alert(`Preset "${presetName}" loaded!`);
}

function deletePreset() {
    const presetSelect = document.getElementById('presetSelect');
    const presetName = presetSelect.value;
    
    if (!presetName) {
        alert('Please select a preset to delete');
        return;
    }

    if (!confirm(`Delete preset "${presetName}"?`)) return;

    let presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    delete presets[presetName];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));

    updatePresetSelect();
    alert(`Preset "${presetName}" deleted!`);
}

function updatePresetSelect() {
    const presetSelect = document.getElementById('presetSelect');
    const currentValue = presetSelect.value;
    
    let presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    const presetNames = Object.keys(presets).sort();
    
    // Clear and rebuild options
    presetSelect.innerHTML = '<option value="">-- Select a preset --</option>';
    presetNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        presetSelect.appendChild(option);
    });
    
    if (presetNames.includes(currentValue)) {
        presetSelect.value = currentValue;
    }
}

function updateSaveButtonText() {
    const presetName = document.getElementById('presetName').value;
    const saveBtn = document.getElementById('savePresetBtn');
    
    if (!presetName) {
        saveBtn.textContent = 'Save';
        return;
    }
    
    let presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    if (presets[presetName]) {
        saveBtn.textContent = 'Override';
    } else {
        saveBtn.textContent = 'Save';
    }
    
    // Do NOT auto-select in dropdown - user must click Load button
}

function downloadPresets() {
    let presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    
    if (Object.keys(presets).length === 0) {
        alert('No presets to download');
        return;
    }
    
    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audio-presets.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function uploadPresets(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const uploadedPresets = JSON.parse(e.target.result);
            let existingPresets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
            
            // Add presets with unique names (don't overwrite)
            let addedCount = 0;
            for (let presetName in uploadedPresets) {
                let uniqueName = presetName;
                let counter = 1;
                
                // Find a unique name if there's a conflict
                while (existingPresets[uniqueName]) {
                    uniqueName = `${presetName} (${counter})`;
                    counter++;
                }
                
                existingPresets[uniqueName] = uploadedPresets[presetName];
                addedCount++;
            }
            
            localStorage.setItem(PRESETS_KEY, JSON.stringify(existingPresets));
            
            updatePresetSelect();
            alert(`${addedCount} preset(s) uploaded successfully!`);
        } catch (error) {
            alert('Error reading preset file: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input so same file can be uploaded again
    event.target.value = '';
}

function openHelpModal() {
    const modal = document.getElementById('helpModal');
    const html = document.documentElement;
    
    html.classList.add('modal-is-open', 'modal-is-opening');
    modal.setAttribute('open', true);
    
    setTimeout(() => {
        html.classList.remove('modal-is-opening');
    }, 400);
}

function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    const html = document.documentElement;
    
    html.classList.add('modal-is-closing');
    
    setTimeout(() => {
        modal.removeAttribute('open');
        html.classList.remove('modal-is-open', 'modal-is-closing');
    }, 400);
}

let distortionGain, delayGain, reverbGain;
let masterGain;

async function loadDefaultPresets() {
    // Check if localStorage already has presets
    const existingPresets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    
    if (Object.keys(existingPresets).length === 0) {
        // No presets found, try to load from file
        try {
            const response = await fetch('js/audio-presets.json');
            if (response.ok) {
                const presets = await response.json();
                localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
                console.log('Default presets loaded from audio-presets.json');
                updatePresetSelect();
            }
        } catch (error) {
            console.log('No default presets file found or error loading:', error);
        }
    }
}

function init() {
    console.log("PAGE LOADED");
    var audio_context = window.AudioContext || window.webkitAudioContext;

    con = new audio_context();


    buildTheAudioGraph();
    startSound();
    defineListeners();
    loadDefaultPresets();
    updatePresetSelect();
    // Initialize button visual state
    const btn = document.getElementById("audioStatus");
    if (btn) {
        btn.innerText = "Click to start audio";
        btn.classList.add('pico-background-green-500');
        btn.classList.remove('pico-background-red');
    }

    // Keep UI in sync when the AudioContext state changes
    if (con) {
        con.onstatechange = updateAudioButtonUI;
        updateAudioButtonUI();
    }
}

// Main function to build the audio graph (the orchestrator)
function buildTheAudioGraph() {
    // 1. Create and configure the main oscillator (Carrier)
    osc = createMainOscillator(300, 'sine');

    // 2. Create and configure the LFO system (Modulator)
    // We return an object to allow access to both the oscillator (to start it)
    // and the GainNode (to connect it to the carrier)
    lfoSystem = createLFO(2, 0);
    lfoSystem2 = createLFO(2, 0);

    square_osc = createMainOscillator(150, 'square');

    // 3. Connect the graph: LFO Gain -> Main Oscillator Frequency
    // This modulates the carrier frequency based on the LFO shape
    lfoSystem.gainNode.connect(osc.frequency);
    lfoSystem2.gainNode.connect(square_osc.frequency);

    // Create gain nodes for oscillator enable/disable
    osc1Gain = con.createGain();
    osc2Gain = con.createGain();
    osc1Gain.gain.value = 1;
    osc2Gain.gain.value = 0;

    lpf = createLPF(22000, 1);
    hpf = createHPF(50, 1);
    
    // Create effects
    distortion = createDistortion(50);
    delay = createDelay(0.3, 0.4);
    reverb = createReverb(2, 0.3);
    
    // Create dry/wet mixing for effect bypass
    const dryGainDistortion = con.createGain();
    const wetGainDistortion = con.createGain();
    const dryGainDelay = con.createGain();
    const wetGainDelay = con.createGain();
    const dryGainReverb = con.createGain();
    const wetGainReverb = con.createGain();
    
    const distortionMixer = con.createGain();
    const delayMixer = con.createGain();
    const reverbMixer = con.createGain();
    
    // Initialize wet at 1, dry at 0 (effects enabled by default)
    wetGainDistortion.gain.value = 0;
    dryGainDistortion.gain.value = 1;
    wetGainDelay.gain.value = 0;
    dryGainDelay.gain.value = 1;
    wetGainReverb.gain.value = 0;
    dryGainReverb.gain.value = 1;
    
    // Store gain references for toggle controls
    distortionGain = { wet: wetGainDistortion, dry: dryGainDistortion };
    delayGain = { wet: wetGainDelay, dry: dryGainDelay };
    reverbGain = { wet: wetGainReverb, dry: dryGainReverb };
    
    // connect oscillators through gain nodes to filter
    osc.connect(osc1Gain);
    square_osc.connect(osc2Gain);
    osc1Gain.connect(lpf);
    osc2Gain.connect(lpf);
    
    // Distortion with bypass
    lpf.connect(hpf);
    hpf.connect(dryGainDistortion);
    hpf.connect(distortion);
    distortion.connect(wetGainDistortion);
    dryGainDistortion.connect(distortionMixer);
    wetGainDistortion.connect(distortionMixer);
    
    // Delay with bypass
    distortionMixer.connect(dryGainDelay);
    distortionMixer.connect(delay.input);
    delay.output.connect(wetGainDelay);
    dryGainDelay.connect(delayMixer);
    wetGainDelay.connect(delayMixer);
    
    // Reverb with bypass
    delayMixer.connect(dryGainReverb);
    delayMixer.connect(reverb.input);
    reverb.convolver.connect(reverb.wetGain);
    reverb.wetGain.connect(wetGainReverb);
    delayMixer.connect(reverb.dryGain);
    reverb.dryGain.connect(wetGainReverb);
    dryGainReverb.connect(reverbMixer);
    wetGainReverb.connect(reverbMixer);
    
    // Master gain control
    masterGain = con.createGain();
    masterGain.gain.value = 0.5; // Default 50% volume
    reverbMixer.connect(masterGain);
    
    // Final output
    masterGain.connect(con.destination);

}

function createLPF(freq, qVal) {
    const filterNode = con.createBiquadFilter();
    filterNode.type = 'lowpass'; 
    filterNode.frequency.value = freq; 
    filterNode.Q.value = qVal; 
    return filterNode;
}

function createHPF(freq, qVal) {
    const filterNode = con.createBiquadFilter();
    filterNode.type = 'highpass'; 
    filterNode.frequency.value = freq; 
    filterNode.Q.value = qVal; 
    return filterNode;
}

// Delay effect with feedback
function createDelay(time, feedback) {
    const delayNode = con.createDelay(5.0);
    const feedbackGain = con.createGain();
    const wetGain = con.createGain();
    const dryGain = con.createGain();
    const merger = con.createGain();
    
    delayNode.delayTime.value = time;
    feedbackGain.gain.value = feedback;
    wetGain.gain.value = 0.5;
    dryGain.gain.value = 0.5;
    
    // Feedback loop
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    
    // Wet/dry mix - connect input to both wet and dry paths
    delayNode.connect(wetGain);
    wetGain.connect(merger);
    delayNode.connect(dryGain);
    dryGain.connect(merger);
    
    return {
        input: delayNode,
        output: merger,
        delayNode: delayNode,
        feedbackGain: feedbackGain,
        wetGain: wetGain,
        dryGain: dryGain
    };
}

// Reverb using convolver
function createReverb(duration, decay) {
    const convolver = con.createConvolver();
    const wetGain = con.createGain();
    const dryGain = con.createGain();
    const merger = con.createGain();
    
    // Create impulse response
    const sampleRate = con.sampleRate;
    const length = sampleRate * duration;
    const impulse = con.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    
    convolver.buffer = impulse;
    wetGain.gain.value = 0.3;
    dryGain.gain.value = 0.7;
    
    // Wet/dry mix - connect input to both wet (convolver) and dry paths
    convolver.connect(wetGain);
    wetGain.connect(merger);
    
    return {
        input: convolver,
        inputDry: convolver,
        output: merger,
        convolver: convolver,
        wetGain: wetGain,
        dryGain: dryGain
    };
}

// Distortion using WaveShaper
function createDistortion(amount) {
    const distortion = con.createWaveShaper();
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
    }
    
    distortion.curve = curve;
    distortion.oversample = '4x';
    
    return distortion;
}

// Function to update distortion curve
function updateDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
    }
    
    distortion.curve = curve;
}

// Function responsible solely for the main oscillator (the audible sound)
function createMainOscillator(frequency, type) {
    const osc = con.createOscillator();
    // Default is sine, but you can parameterize the wave type here
    osc.type = type || 'sine';
    osc.frequency.value = frequency;
    return osc;
}

// Function building the complete LFO module (Oscillator + Gain for depth control)
function createLFO(frequency, gain) {
    const lfo = con.createOscillator();
    const lfoAmp = con.createGain();

    lfo.frequency.value = frequency; // e.g., 2 Hz
    lfoAmp.gain.value = gain;       // e.g., 100 (modulation depth)

    // Internal LFO connection: Oscillator -> Gain Node
    lfo.connect(lfoAmp);

    // Return both nodes because we need the GainNode for connection
    // and the OscillatorNode for control (e.g., start/stop)
    return {
        oscillator: lfo,
        gainNode: lfoAmp
    };
}

// Helper function for square wave (kept from original code)
function createSquareOscillator(frequency) {
    let square_osc = con.createOscillator();
    square_osc.type = "square";
    square_osc.frequency.value = frequency;
    return square_osc;
} 

function startSound() {
    console.log("starting sound");
    osc.start();
    lfoSystem.oscillator.start();
    lfoSystem2.oscillator.start();
    square_osc.start();
    updateDisplay();
}

// this function sets up event listeners : some keys play notes
// moving the mouse changes frequencies and modulation rate
function defineListeners() {
    console.log("defining listeners");
    document.addEventListener("keydown", function (event) {
        if (con.state !== 'running' || !keyboardEnabled) return;
        setNote(event.key);
        // Keep audio context active if needed
        con.resume();
        updateDisplay();
    });

    document.addEventListener("mousemove", function (event) {
        if (con.state !== 'running' || !mouseEnabled) return;
        
        // Don't control audio if user is focused on an input field
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
            return;
        }
        
        const lfoFreq = event.clientX / 20;
        const oscFreq = event.clientY;
        
        lfoSystem.oscillator.frequency.value = lfoFreq;
        osc.frequency.value = oscFreq;
        
        // Update sliders to match
        const lfoSlider = document.getElementById("lfoFreqInput");
        const oscSlider = document.getElementById("firstOscInput");
        if (lfoSlider) lfoSlider.value = lfoFreq;
        if (oscSlider) oscSlider.value = oscFreq;
        
        con.resume();
        updateDisplay();
    });
    document.getElementById("HPFinput").addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        hpf.frequency.value = event.target.value;
        console.log(event.target.value);
        con.resume();
        updateDisplay();
    });
    document.getElementById("LPFinput").addEventListener("input", function (event) {
        lpf.frequency.value = event.target.value;
        console.log("LPF value:", event.target.value, "lpf.frequency.value:", lpf.frequency.value);
        if (con.state === 'running') {
            con.resume();
        }
        updateDisplay();
    });
    document.getElementById("squareOscInput").addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        square_osc.frequency.value = event.target.value;
        con.resume();
        updateDisplay();
    });
    document.getElementById("firstOscInput")?.addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        osc.frequency.value = event.target.value;
        con.resume();
        updateDisplay();
    });
    const lfoFreqEl = document.getElementById("lfoFreqInput");
    if (lfoFreqEl) {
        lfoFreqEl.addEventListener("input", function (event) {
            if (con.state !== 'running') return;
            lfoSystem.oscillator.frequency.value = parseFloat(event.target.value);
            con.resume();
            updateDisplay();
        });
    }
    
    const lfoFreq2El = document.getElementById("lfoFreq2Input");
    if (lfoFreq2El) {
        lfoFreq2El.addEventListener("input", function (event) {
            if (con.state !== 'running') return;
            lfoSystem2.oscillator.frequency.value = parseFloat(event.target.value);
            con.resume();
            updateDisplay();
        });
    }
    
    // Effect controls
    document.getElementById("delayTimeInput").addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        const newDelayTime = parseFloat(event.target.value);
        // Smooth the delay time change to avoid clicks
        delay.delayNode.delayTime.setTargetAtTime(newDelayTime, con.currentTime, 0.01);
        con.resume();
        updateDisplay();
    });
    
    document.getElementById("delayFeedbackInput").addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        delay.feedbackGain.gain.value = parseFloat(event.target.value);
        con.resume();
        updateDisplay();
    });
    
    document.getElementById("reverbMixInput").addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        const wetAmount = parseFloat(event.target.value);
        reverb.wetGain.gain.value = wetAmount;
        reverb.dryGain.gain.value = 1 - wetAmount;
        con.resume();
        updateDisplay();
    });
    
    document.getElementById("distortionLevelInput")?.addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        const distortionAmount = parseFloat(event.target.value);
        updateDistortionCurve(distortionAmount);
        con.resume();
        updateDisplay();
    });
    
    // Master level control
    document.getElementById("masterLevelInput")?.addEventListener("input", function (event) {
        if (con.state !== 'running') return;
        masterGain.gain.value = parseFloat(event.target.value);
        con.resume();
        updateDisplay();
    });
    
    // Oscillator enable/disable controls
    document.getElementById("osc1Toggle").addEventListener("change", function(event) {
        if (con.state !== 'running') return;
        osc1Gain.gain.value = event.target.checked ? 1 : 0;
        con.resume();
    });
    
    document.getElementById("osc2Toggle")?.addEventListener("change", function(event) {
        if (con.state !== 'running') return;
        osc2Gain.gain.value = event.target.checked ? 1 : 0;
        con.resume();
    });
    
    document.getElementById("osc1Type")?.addEventListener("change", function(event) {
        osc.type = event.target.value;
    });
    
    document.getElementById("osc2Type")?.addEventListener("change", function(event) {
        square_osc.type = event.target.value;
    });
    
    document.getElementById("lfoToggle")?.addEventListener("change", function(event) {
        if (con.state !== 'running') return;
        lfoSystem.gainNode.gain.value = event.target.checked ? 100 : 0;
        con.resume();
    });
    
    document.getElementById("lfo2Toggle")?.addEventListener("change", function(event) {
        if (con.state !== 'running') return;
        lfoSystem2.gainNode.gain.value = event.target.checked ? 100 : 0;
        con.resume();
    });
    
    document.getElementById("mouseToggle")?.addEventListener("change", function(event) {
        mouseEnabled = event.target.checked;
    });
    
    document.getElementById("keyboardToggle")?.addEventListener("change", function(event) {
        keyboardEnabled = event.target.checked;
    });
    
    document.getElementById("distortionToggle")?.addEventListener("change", function(event) {
        if (event.target.checked) {
            distortionGain.wet.gain.value = 1;
            distortionGain.dry.gain.value = 0;
        } else {
            distortionGain.wet.gain.value = 0;
            distortionGain.dry.gain.value = 1;
        }
    });
    
    document.getElementById("delayToggle")?.addEventListener("change", function(event) {
        if (event.target.checked) {
            delayGain.wet.gain.value = 1;
            delayGain.dry.gain.value = 0;
        } else {
            delayGain.wet.gain.value = 0;
            delayGain.dry.gain.value = 1;
        }
    });
    
    document.getElementById("reverbToggle")?.addEventListener("change", function(event) {
        if (event.target.checked) {
            reverbGain.wet.gain.value = 1;
            reverbGain.dry.gain.value = 0;
        } else {
            reverbGain.wet.gain.value = 0;
            reverbGain.dry.gain.value = 1;
        }
    });
    
    // Preset name input listener - only updates button text, doesn't load
    document.getElementById("presetName")?.addEventListener("input", function(event) {
        updateSaveButtonText();
    });
}

function updateDisplay() {
    if (!osc || !hpf || !lpf) return;
    try {
        document.getElementById("freq1Display").innerText = Math.round(osc.frequency.value);
        document.getElementById("freq2Display").innerText = Math.round(square_osc.frequency.value);
        document.getElementById("freqLfo").innerText = Math.round(lfoSystem.oscillator.frequency.value);
        document.getElementById("freqLfo2").innerText = Math.round(lfoSystem2.oscillator.frequency.value);
        document.getElementById("HPFDisplay").innerText = Math.round(hpf.frequency.value);
        
        const lpfDisplay = document.getElementById("LPFDisplay");
        if (lpfDisplay) {
            const newValue = Math.round(lpf.frequency.value);
            console.log("Updating LPFDisplay to:", newValue);
            lpfDisplay.innerText = newValue;
        } else {
            console.log("LPFDisplay element not found!");
        }
        
        // Effect displays
        if (delay && document.getElementById("delayTimeDisplay")) {
            document.getElementById("delayTimeDisplay").innerText = delay.delayNode.delayTime.value.toFixed(2);
        }
        if (delay && document.getElementById("delayFeedbackDisplay")) {
            document.getElementById("delayFeedbackDisplay").innerText = delay.feedbackGain.gain.value.toFixed(2);
        }
        if (reverb && document.getElementById("reverbMixDisplay")) {
            document.getElementById("reverbMixDisplay").innerText = reverb.wetGain.gain.value.toFixed(2);
        }
        if (document.getElementById("distortionLevelDisplay")) {
            const distortionInput = document.getElementById("distortionLevelInput");
            if (distortionInput) {
                document.getElementById("distortionLevelDisplay").innerText = distortionInput.value;
            }
        }
        if (document.getElementById("masterLevelDisplay") && masterGain) {
            document.getElementById("masterLevelDisplay").innerText = masterGain.gain.value.toFixed(2);
        }
    } catch (e) {
        console.log("Display elements not found.");
    }
}

// Keep the audio button UI in sync with the actual AudioContext state
function updateAudioButtonUI() {
    const btn = document.getElementById("audioStatus");
    if (!btn || !con) return;
    if (con.state === 'running') {
        btn.innerText = "Click to stop audio";
        btn.classList.remove('pico-background-green-500');
        btn.classList.add('pico-background-red');
    } else {
        btn.innerText = "Click to start audio";
        btn.classList.remove('pico-background-red');
        btn.classList.add('pico-background-green-500');
    }
}

async function toggleAudio() {
    // Toggle audio context and update UI only after the operation completes
    try {
        if (con.state === 'running') {
            await con.suspend();
            console.log("Audio stopped");
        } else {
            await con.resume();
            console.log("Audio started");
        }
    } catch (e) {
        console.log("Audio toggle error:", e);
    }
    updateAudioButtonUI();
}

// this function is called when the user
// presses a key on the keboard
// it receives the key they pressed as 'key'
function setNote(key) {
    // look at the value of key (the key the user pressed)
    // and do different things depending what it is
    if (key == "w") {// they pressed the z key
        // play a c
        osc.frequency.value = 261.63;
        // this frequency value is from here: http://www.phy.mtu.edu/~suits/notefreqs.html
    }
    if (key == "x") {
        // play a c
        osc.frequency.value = 293.66;
    }
    if (key == "c") {
        // play a c
        osc.frequency.value = 329.63;
    }
    if (key == "v") {
        // play a c
        osc.frequency.value = 349.23;
    }
}
