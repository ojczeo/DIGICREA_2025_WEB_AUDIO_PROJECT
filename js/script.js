window.onload = init;

let con, osc, square_osc, lfoSystem, lfo_amp, lpf, hpf, delay, reverb, distortion, osc1Gain, osc2Gain, osc1Panner, osc2Panner;
let lfoSystem2;
let mouseEnabled = false;
let mouseOsc1Enabled = true;
let mouseOsc2Enabled = false;
let keyboardEnabled = false;
let osc1Analyser, osc2Analyser, masterAnalyser;
let animationId;
let waveformScales = { osc1: 1, osc2: 1, master: 1 };
let masterSpectrumMode = false;
let osc1SpectrumMode = false;
let osc2SpectrumMode = false;

const PRESETS_KEY = 'audioPresets';

function updateMouseToggleVisibility(enabled) {
    const toggles = document.querySelectorAll('.mouse-osc-toggle');
    toggles.forEach(el => {
        el.style.display = enabled ? 'inline-flex' : 'none';
    });
}

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
        osc1Level: parseFloat(document.getElementById('osc1LevelInput').value),
        osc1Pan: parseFloat(document.getElementById('osc1PanInput').value),
        lfo1Enabled: document.getElementById('lfoToggle').checked,
        lfo1Freq: parseFloat(document.getElementById('lfoFreqInput').value),
        // Oscillator 2
        osc2Type: document.getElementById('osc2Type').value,
        osc2Freq: parseFloat(document.getElementById('squareOscInput').value),
        osc2Enabled: document.getElementById('osc2Toggle').checked,
        osc2Level: parseFloat(document.getElementById('osc2LevelInput').value),
        osc2Pan: parseFloat(document.getElementById('osc2PanInput').value),
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
    const osc1Level = preset.osc1Level !== undefined ? preset.osc1Level : 0.5;
    document.getElementById('osc1LevelInput').value = osc1Level;
    document.getElementById('osc1LevelDisplay').textContent = osc1Level.toFixed(2);
    osc1Gain.gain.value = preset.osc1Enabled ? osc1Level : 0;
    const osc1Pan = preset.osc1Pan !== undefined ? preset.osc1Pan : 0;
    document.getElementById('osc1PanInput').value = osc1Pan;
    document.getElementById('osc1PanDisplay').textContent = osc1Pan.toFixed(2);
    osc1Panner.pan.value = osc1Pan;
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
    const osc2Level = preset.osc2Level !== undefined ? preset.osc2Level : 0.5;
    document.getElementById('osc2LevelInput').value = osc2Level;
    document.getElementById('osc2LevelDisplay').textContent = osc2Level.toFixed(2);
    osc2Gain.gain.value = preset.osc2Enabled ? osc2Level : 0;
    const osc2Pan = preset.osc2Pan !== undefined ? preset.osc2Pan : 0;
    document.getElementById('osc2PanInput').value = osc2Pan;
    document.getElementById('osc2PanDisplay').textContent = osc2Pan.toFixed(2);
    osc2Panner.pan.value = osc2Pan;
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

function generateDynamicFlowchart() {
    const osc1On = document.getElementById('osc1Toggle')?.checked;
    const osc2On = document.getElementById('osc2Toggle')?.checked;
    const lfo1On = document.getElementById('lfoToggle')?.checked;
    const lfo2On = document.getElementById('lfo2Toggle')?.checked;
    const distOn = document.getElementById('distortionToggle')?.checked;
    const delayOn = document.getElementById('delayToggle')?.checked;
    const reverbOn = document.getElementById('reverbToggle')?.checked;
    
    let diagram = 'graph TB\n';
    let classes = [];
    let lastNode = null;
    
    // Track which nodes to connect
    const activeOscs = [];
    
    // Oscillator 1
    if (osc1On) {
        if (lfo1On) {
            diagram += '    LFO1["LFO 1<br/>Modulation"] -.-> OSC1\n';
            classes.push('LFO1');
        }
        diagram += '    OSC1["Oscillator 1<br/>Sine/Square/Saw/Triangle"] --> GAIN1["Gain 1<br/>Level Control"]\n';
        diagram += '    GAIN1 --> PAN1["Pan 1<br/>Stereo Position"]\n';
        diagram += '    PAN1 --> ANALYZER1["Analyzer 1<br/>Waveform"]\n';
        activeOscs.push('ANALYZER1');
        classes.push('OSC1', 'GAIN1', 'PAN1', 'ANALYZER1');
    }
    
    // Oscillator 2
    if (osc2On) {
        if (lfo2On) {
            diagram += '    LFO2["LFO 2<br/>Modulation"] -.-> OSC2\n';
            classes.push('LFO2');
        }
        diagram += '    OSC2["Oscillator 2<br/>Sine/Square/Saw/Triangle"] --> GAIN2["Gain 2<br/>Level Control"]\n';
        diagram += '    GAIN2 --> PAN2["Pan 2<br/>Stereo Position"]\n';
        diagram += '    PAN2 --> ANALYZER2["Analyzer 2<br/>Waveform"]\n';
        activeOscs.push('ANALYZER2');
        classes.push('OSC2', 'GAIN2', 'PAN2', 'ANALYZER2');
    }
    
    // If no oscillators are on, show inactive state
    if (activeOscs.length === 0) {
        diagram += '    INACTIVE["⚠️ No Active Oscillators<br/>Enable OSC1 or OSC2"]\n';
        diagram += '    classDef inactiveStyle fill:#666,stroke:#888,stroke-width:2px,color:#fff\n';
        diagram += '    class INACTIVE inactiveStyle\n';
        return diagram;
    }
    
    // Connect oscillators to filters20
    diagram += '    LPF["Low Pass Filter<br/>8kHz - 22.5kHz"]\n';
    for (const osc of activeOscs) {
        diagram += `    ${osc} --> LPF\n`;
    }
    diagram += '    LPF --> HPF["High Pass Filter<br/>20Hz - 8kHz"]\n';
    lastNode = 'HPF';
    classes.push('LPF', 'HPF');
    
    // Effects chain
    if (distOn) {
        diagram += `    ${lastNode} --> DIST["Distortion<br/>WaveShaper + Mix"]\n`;
        lastNode = 'DIST';
        classes.push('DIST');
    }
    
    if (delayOn) {
        diagram += `    ${lastNode} --> DELAY["Delay<br/>Time + Feedback"]\n`;
        lastNode = 'DELAY';
        classes.push('DELAY');
    }
    
    if (reverbOn) {
        diagram += `    ${lastNode} --> REVERB["Reverb<br/>Convolver + Mix"]\n`;
        lastNode = 'REVERB';
        classes.push('REVERB');
    }
    
    // Master section
    diagram += `    ${lastNode} --> MASTER_GAIN["Master Gain<br/>Volume Control"]\n`;
    diagram += '    MASTER_GAIN --> MASTER_ANALYZER["Master Analyzer<br/>Waveform"]\n';
    diagram += '    MASTER_ANALYZER --> OUTPUT["🔊 Audio Output<br/>Destination"]\n';
    classes.push('MASTER_GAIN', 'MASTER_ANALYZER', 'OUTPUT');
    
    // Add class definitions
    diagram += '\n    classDef sourceStyle fill:#0891b2,stroke:#06b6d4,stroke-width:2px,color:#fff\n';
    diagram += '    classDef lfoStyle fill:#6366f1,stroke:#818cf8,stroke-width:2px,color:#fff,stroke-dasharray: 5 5\n';
    diagram += '    classDef gainStyle fill:#059669,stroke:#10b981,stroke-width:2px,color:#fff\n';
    diagram += '    classDef analyzerStyle fill:#7c3aed,stroke:#a78bfa,stroke-width:2px,color:#fff\n';
    diagram += '    classDef filterStyle fill:#db2777,stroke:#ec4899,stroke-width:2px,color:#fff\n';
    diagram += '    classDef effectStyle fill:#ea580c,stroke:#fb923c,stroke-width:2px,color:#fff\n';
    diagram += '    classDef masterStyle fill:#16a34a,stroke:#22c55e,stroke-width:2px,color:#fff\n';
    diagram += '    classDef outputStyle fill:#dc2626,stroke:#ef4444,stroke-width:3px,color:#fff\n\n';
    
    // Apply classes
    if (classes.includes('OSC1') || classes.includes('OSC2')) {
        const oscs = classes.filter(c => c === 'OSC1' || c === 'OSC2');
        diagram += `    class ${oscs.join(',')} sourceStyle\n`;
    }
    if (classes.includes('LFO1') || classes.includes('LFO2')) {
        const lfos = classes.filter(c => c === 'LFO1' || c === 'LFO2');
        diagram += `    class ${lfos.join(',')} lfoStyle\n`;
    }
    if (classes.includes('GAIN1') || classes.includes('GAIN2')) {
        const gains = classes.filter(c => c === 'GAIN1' || c === 'GAIN2');
        diagram += `    class ${gains.join(',')} gainStyle\n`;
    }
    if (classes.includes('PAN1') || classes.includes('PAN2')) {
        const pans = classes.filter(c => c === 'PAN1' || c === 'PAN2');
        diagram += `    class ${pans.join(',')} gainStyle\n`;
    }
    if (classes.includes('ANALYZER1') || classes.includes('ANALYZER2') || classes.includes('MASTER_ANALYZER')) {
        const analyzers = classes.filter(c => c === 'ANALYZER1' || c === 'ANALYZER2' || c === 'MASTER_ANALYZER');
        diagram += `    class ${analyzers.join(',')} analyzerStyle\n`;
    }
    if (classes.includes('LPF') || classes.includes('HPF')) {
        diagram += '    class LPF,HPF filterStyle\n';
    }
    if (classes.includes('DIST') || classes.includes('DELAY') || classes.includes('REVERB')) {
        const effects = classes.filter(c => c === 'DIST' || c === 'DELAY' || c === 'REVERB');
        diagram += `    class ${effects.join(',')} effectStyle\n`;
    }
    diagram += '    class MASTER_GAIN masterStyle\n';
    diagram += '    class OUTPUT outputStyle\n';
    
    return diagram;
}

function openRoutingModal() {
    const modal = document.getElementById('routingModal');
    const html = document.documentElement;
    
    html.classList.add('modal-is-open', 'modal-is-opening');
    modal.setAttribute('open', true);
    
    // Generate and render dynamic Mermaid diagram
    setTimeout(() => {
        const mermaidElement = document.getElementById('dynamicMermaid');
        if (mermaidElement) {
            // Clear previous diagram
            mermaidElement.removeAttribute('data-processed');
            mermaidElement.innerHTML = '';
            
            // Generate new diagram based on current state
            const diagramCode = generateDynamicFlowchart();
            mermaidElement.textContent = diagramCode;
            
            // Render with Mermaid
            mermaid.init(undefined, mermaidElement);
        }
    }, 200);
    
    setTimeout(() => {
        html.classList.remove('modal-is-opening');
    }, 400);
}

function closeRoutingModal() {
    const modal = document.getElementById('routingModal');
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
    updateMouseToggleVisibility(document.getElementById('mouseToggle')?.checked ?? false);
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

    // Create panner nodes for stereo positioning
    osc1Panner = con.createStereoPanner();
    osc2Panner = con.createStereoPanner();
    osc1Panner.pan.value = 0; // center
    osc2Panner.pan.value = 0; // center

    // Create analyzers for waveform visualization
    osc1Analyser = con.createAnalyser();
    osc1Analyser.fftSize = 2048;
    osc2Analyser = con.createAnalyser();
    osc2Analyser.fftSize = 2048;
    masterAnalyser = con.createAnalyser();
    masterAnalyser.fftSize = 2048;

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
    
    // Initialize wet at 0, dry at 1 (effects disabled by default)
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
    
    // connect oscillators through gain nodes and panners to analyzers and filter
    osc.connect(osc1Gain);
    osc1Gain.connect(osc1Panner);
    osc1Panner.connect(osc1Analyser);
    osc1Analyser.connect(lpf);
    
    square_osc.connect(osc2Gain);
    osc2Gain.connect(osc2Panner);
    osc2Panner.connect(osc2Analyser);
    osc2Analyser.connect(lpf);
    
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
    
    // Connect master gain to analyzer and destination
    masterGain.connect(masterAnalyser);
    masterAnalyser.connect(con.destination);

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
    startVisualization();
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

    document.addEventListener("mousemove", async function (event) {
        if (!mouseEnabled) return;
        if (con.state !== 'running') {
            try {
                await con.resume();
            } catch (e) {
                return;
            }
        }
        
        // Don't control audio if user is focused on an input field
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'TEXTAREA') {
            return;
        }
        
        // If no oscillator mouse targets are enabled, skip.
        if (!mouseOsc1Enabled && !mouseOsc2Enabled) return;

        const lfoSlider1 = document.getElementById("lfoFreqInput");
        const oscSlider1 = document.getElementById("firstOscInput");
        const lfoSlider2 = document.getElementById("lfoFreq2Input");
        const oscSlider2 = document.getElementById("squareOscInput");

        const lfoMin = parseFloat((lfoSlider1 || lfoSlider2)?.min ?? 0.1);
        const lfoMax = parseFloat((lfoSlider1 || lfoSlider2)?.max ?? 50);
        const oscMin = parseFloat((oscSlider1 || oscSlider2)?.min ?? 20);
        const oscMax = parseFloat((oscSlider1 || oscSlider2)?.max ?? 4000);
        
        const xRatio = Math.min(Math.max(event.clientX / window.innerWidth, 0), 1);
        const yRatio = Math.min(Math.max(event.clientY / window.innerHeight, 0), 1);
        
        const lfoFreq = lfoMin + xRatio * (lfoMax - lfoMin);
        const oscFreq = oscMin + yRatio * (oscMax - oscMin);
        
        if (mouseOsc1Enabled) {
            lfoSystem.oscillator.frequency.value = lfoFreq;
            osc.frequency.value = oscFreq;
            if (lfoSlider1) lfoSlider1.value = lfoFreq;
            if (oscSlider1) oscSlider1.value = oscFreq;
        }

        if (mouseOsc2Enabled) {
            lfoSystem2.oscillator.frequency.value = lfoFreq;
            square_osc.frequency.value = oscFreq;
            if (lfoSlider2) lfoSlider2.value = lfoFreq;
            if (oscSlider2) oscSlider2.value = oscFreq;
        }
        
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
        const level = parseFloat(document.getElementById('osc1LevelInput').value);
        osc1Gain.gain.value = event.target.checked ? level : 0;
        con.resume();
    });
    
    document.getElementById("osc2Toggle")?.addEventListener("change", function(event) {
        if (con.state !== 'running') return;
        const level = parseFloat(document.getElementById('osc2LevelInput').value);
        osc2Gain.gain.value = event.target.checked ? level : 0;
        con.resume();
    });
    
    // Oscillator level controls
    document.getElementById("osc1LevelInput")?.addEventListener("input", function(event) {
        if (con.state !== 'running') return;
        const level = parseFloat(event.target.value);
        const isEnabled = document.getElementById('osc1Toggle').checked;
        osc1Gain.gain.value = isEnabled ? level : 0;
        document.getElementById('osc1LevelDisplay').textContent = level.toFixed(2);
        con.resume();
    });
    
    document.getElementById("osc2LevelInput")?.addEventListener("input", function(event) {
        if (con.state !== 'running') return;
        const level = parseFloat(event.target.value);
        const isEnabled = document.getElementById('osc2Toggle').checked;
        osc2Gain.gain.value = isEnabled ? level : 0;
        document.getElementById('osc2LevelDisplay').textContent = level.toFixed(2);
        con.resume();
    });
    
    document.getElementById("osc1PanInput")?.addEventListener("input", function(event) {
        if (con.state !== 'running') return;
        const pan = parseFloat(event.target.value);
        osc1Panner.pan.value = pan;
        document.getElementById('osc1PanDisplay').textContent = pan.toFixed(2);
        con.resume();
    });
    
    document.getElementById("osc2PanInput")?.addEventListener("input", function(event) {
        if (con.state !== 'running') return;
        const pan = parseFloat(event.target.value);
        osc2Panner.pan.value = pan;
        document.getElementById('osc2PanDisplay').textContent = pan.toFixed(2);
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
    
    document.getElementById("mouseToggle")?.addEventListener("change", async function(event) {
        mouseEnabled = event.target.checked;
        updateMouseToggleVisibility(mouseEnabled);
        if (mouseEnabled && con?.state !== 'running') {
            try {
                await con.resume();
            } catch (e) {
                console.warn('AudioContext resume blocked', e);
            }
        }
    });

    document.getElementById("osc1MouseToggle")?.addEventListener("change", function(event) {
        mouseOsc1Enabled = event.target.checked;
    });

    document.getElementById("osc2MouseToggle")?.addEventListener("change", function(event) {
        mouseOsc2Enabled = event.target.checked;
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
        btn.innerText = "🔇 Click to stop audio";
        btn.classList.remove('pico-background-green-500');
        btn.classList.add('pico-background-red');
    } else {
        btn.innerText = "🔊 Click to start audio";
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
    const k = key?.toLowerCase?.();
    if (!k) return;

    const osc1Slider = document.getElementById("firstOscInput");
    const osc2Slider = document.getElementById("squareOscInput");
    const stepHz = 10;

    const adjust = (slider, oscNode, delta) => {
        if (!slider || !oscNode) return;
        const min = parseFloat(slider.min ?? 20);
        const max = parseFloat(slider.max ?? 4000);
        const current = parseFloat(slider.value || oscNode.frequency.value || min);
        const next = Math.min(max, Math.max(min, current + delta));
        slider.value = next;
        oscNode.frequency.value = next;
    };

    if (k === 'z') {
        adjust(osc1Slider, osc, -stepHz);
    } else if (k === 'x') {
        adjust(osc1Slider, osc, stepHz);
    } else if (k === 'c') {
        adjust(osc2Slider, square_osc, -stepHz);
    } else if (k === 'v') {
        adjust(osc2Slider, square_osc, stepHz);
    } else {
        return;
    }

    updateDisplay();
}

// Waveform visualization functions
function startVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    drawWaveforms();
}

function drawWaveforms() {
    animationId = requestAnimationFrame(drawWaveforms);
    
    // Draw oscillator 1 - waveform or spectrum based on toggle
    if (osc1SpectrumMode) {
        drawSpectrum(osc1Analyser, 'osc1Canvas', '#00ffff');
    } else {
        drawWaveform(osc1Analyser, 'osc1Canvas', '#00ffff', waveformScales.osc1);
    }
    
    // Draw oscillator 2 - waveform or spectrum based on toggle
    if (osc2SpectrumMode) {
        drawSpectrum(osc2Analyser, 'osc2Canvas', '#ff00ff');
    } else {
        drawWaveform(osc2Analyser, 'osc2Canvas', '#ff00ff', waveformScales.osc2);
    }
    
    // Draw master output - waveform or spectrum based on toggle
    if (masterSpectrumMode) {
        drawSpectrum(masterAnalyser, 'masterCanvas', '#00ff00');
    } else {
        drawWaveform(masterAnalyser, 'masterCanvas', '#00ff00', waveformScales.master);
    }
}

function drawWaveform(analyser, canvasId, color, scale = 1) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteTimeDomainData(dataArray);
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Draw waveform with horizontal scaling
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    
    // Calculate how many samples to display based on scale
    // scale > 1 = zoom in (fewer samples), scale <= 1 = show all samples
    const samplesToDisplay = Math.min(bufferLength, Math.floor(bufferLength / scale));
    const sliceWidth = canvas.width / samplesToDisplay;
    let x = 0;
    
    for (let i = 0; i < samplesToDisplay; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.stroke();
}

function drawSpectrum(analyser, canvasId, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 1; i < gridLines; i++) {
        const y = (canvas.height / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw spectrum bars
    const barWidth = canvas.width / bufferLength;
    ctx.fillStyle = color;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const x = i * barWidth;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    }
    
    // Draw frequency labels
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const frequencies = [0, 2000, 4000, 8000, 16000, 22000];
    for (const freq of frequencies) {
        const x = (freq / 22000) * canvas.width;
        if (x >= 0 && x <= canvas.width) {
            ctx.fillText(freq + 'Hz', x, canvas.height - 5);
        }
    }
}

function toggleMasterSpectrum() {
    masterSpectrumMode = document.getElementById('spectrumToggle').checked;
    const masterScaleControls = document.getElementById('masterCanvas').nextElementSibling;
    masterScaleControls.style.display = masterSpectrumMode ? 'none' : 'flex';
}

function toggleOscillatorSpectrum(osc) {
    if (osc === 'osc1') {
        osc1SpectrumMode = document.getElementById('osc1SpectrumToggle').checked;
        const osc1ScaleControls = document.getElementById('osc1Canvas').parentElement.querySelector('.scale-controls');
        osc1ScaleControls.style.display = osc1SpectrumMode ? 'none' : 'flex';
    } else if (osc === 'osc2') {
        osc2SpectrumMode = document.getElementById('osc2SpectrumToggle').checked;
        const osc2ScaleControls = document.getElementById('osc2Canvas').parentElement.querySelector('.scale-controls');
        osc2ScaleControls.style.display = osc2SpectrumMode ? 'none' : 'flex';
    }
}

function changeScale(oscillator, delta) {
    waveformScales[oscillator] = Math.max(0.5, Math.min(10, waveformScales[oscillator] + delta));
}
