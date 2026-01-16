# Web Audio Synth: Dual Oscillators with Stereo Panning, LFO Modulation, Filters & Effects

A professional browser-based synthesizer built with the Web Audio API. Features two independently controllable oscillators with stereo panning, per-oscillator LFO modulation, parametric filters (HPF/LPF), a comprehensive effects chain (Distortion, Delay, Reverb), and an intuitive preset management system with visual signal flow routing diagram.

## Features

### Oscillators
- **Two independent oscillators** with selectable waveforms: Sine, Square, Sawtooth, Triangle
- **Per-oscillator controls:**
  - Frequency range: 20 Hz – 4000 Hz
  - Level control: 0.0 – 1.0 (individual volume per oscillator)
  - Stereo panning: −1.0 (left) to +1.0 (right) for spatial positioning
  - On/off toggle switch

### LFO Modulation
- **Two independent LFOs** (one per oscillator)
- **LFO controls:**
  - Frequency range: 0.1 Hz – 50 Hz (expanded for dramatic modulation effects)
  - Toggle enable/disable per LFO
  - Modulates oscillator frequency in real-time

### MIDI Control
- **Web MIDI API integration** for external MIDI keyboard support
- **Per-oscillator routing:** Choose which oscillators respond to MIDI via OSC1/OSC2 switches (enables legato playing)
- **Note-to-frequency mapping:** MIDI notes (0–127) convert to frequencies using standard A4=440Hz tuning
- **Two MIDI gain modes:**
  - **Velocity Mode (default):** MIDI note velocity (0–127) maps to gain (0–1); provides natural dynamics responsive to playing intensity
  - **Modwheel-Only Mode:** Modulation wheel (CC1) exclusively controls gain; notes play at full volume with level controlled smoothly by wheel movement
  - Toggle "Use Velocity" to switch between modes anytime
- **Legato support:** Multiple overlapping MIDI notes play smoothly without retriggering; silence only when all keys are released

### Filters
- **High-Pass Filter (HPF):** 20 Hz – 8000 Hz cutoff frequency
- **Low-Pass Filter (LPF):** 8000 Hz – 22500 Hz cutoff frequency
- Smooth, real-time frequency adjustment

### Effects Chain
- **Distortion:** WaveShaper with adjustable amount (0–100)
- **Delay:** Configurable time (0–2 seconds) and feedback (0–0.9)
- **Reverb:** Convolver-based with wet/dry mix control (0–1.0)
- All effects can be toggled on/off independently
- Wet/dry bypass mixing for each effect

### Master Output
- **Master gain control:** 0.0 – 1.0 (global output volume)
- **Real-time waveform analyzer** showing combined output
- **Visual signal flow diagram** showing active components and routing

### Presets & Visualization
- **Save/Load/Delete presets** via dropdown menu
- **Export presets** to JSON file for backup/sharing
- **Import presets** from JSON file
- **Dynamic routing diagram:** Interactive Mermaid flowchart showing:
  - All active oscillators with level and pan positions
  - LFO modulation connections (dashed lines)
  - Filter stages and active effects
  - Master output and destination
  - Color-coded nodes by component type
- **Preset data includes:** all oscillator settings, filter frequencies, effect states, levels, panning, and LFO parameters

### Waveform Visualization
- **Real-time waveform displays** for each oscillator and master output
- **Zoom controls** (±) to scale waveform amplitude
- **FFT analysis** for frequency-domain visualization

### UI/UX
- **Modal dialogs** with click-to-close on overlay
- **Emoji icons** on all buttons for quick recognition
- **Organized layout** with on/off switches in oscillator headers
- **Responsive grid layout** for intuitive control grouping
- **Color-coded interface** using Pico.css

## Getting Started

### Prerequisites
- Modern browser supporting Web Audio API (Chrome, Edge, Firefox, Safari)

### Open Online
https://ojczeo.github.io/DIGICREA_2025_WEB_AUDIO_PROJECT/

### Run Locally
Option 1 (Node):
```bash
cd "DIGICREA_2025_WEB_AUDIO_PROJECT"
npx serve -p 8000
```

Option 2 (VS Code):
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

Option 3 (Direct):
- Open `index.html` directly in browser (audio works; presets may not load from JSON due to CORS)

## Usage

1. **Start Audio:** Click "🔊 Click to start audio" or interact with others controlls to initialize the audio context
2. **Enable Controls:**
   - Toggle **Keyboard Control** to nudge frequencies: Z/X adjust OSC1 by ±10 Hz; C/V adjust OSC2 by ±10 Hz (clamped to slider ranges)
   - Toggle **Mouse Control**; the full browser window maps vertical motion to frequency and horizontal to LFO rate. Use the per-oscillator mouse switches (OSC1/OSC2) to choose which oscillators react; input fields are ignored so typing doesn't affect audio
   - Toggle **MIDI Control** and select a MIDI device. Play MIDI notes to control oscillator frequencies. Use per-oscillator switches (OSC1/OSC2) to route notes to specific oscillators. Choose between two MIDI modes:
     - **Velocity Mode (default):** MIDI note velocity controls oscillator gain (0–127 → 0–1)
     - **Modwheel-Only Mode:** Modulation wheel (CC1) exclusively controls gain; notes play at full volume for consistent dynamics via wheel control
     - Toggle "Use Velocity" to switch between modes
3. **Configure Oscillators:**
   - Toggle OSC1/OSC2 on/off via checkbox in header
   - Set frequency, waveform type, level, and pan for each
   - Enable LFO and set modulation frequency (0.1–50 Hz)
4. **Shape Tone:**
   - Adjust HPF cutoff (20–8000 Hz) to remove low frequencies
   - Adjust LPF cutoff (8000–22500 Hz) to remove high frequencies
5. **Add Effects:**
   - Toggle Distortion, Delay, and/Reverb independently
   - Adjust effect parameters (amount, time, feedback, mix)
6. **Control Output:**
   - Use Master Level slider to set global volume
7. **Monitor Signal Flow:**
   - Click "🔀 Routing" to view the dynamic signal flow diagram
8. **Save Your Sound:**
   - Enter a preset name and click "💾 Save"
   - Load saved presets from dropdown
   - Export to JSON or import from file

## Presets

Presets store:
- Oscillator types, frequencies, levels, panning, enable states
- LFO frequencies and enable states
- Filter cutoff frequencies
- Effect settings (distortion amount, delay time/feedback, reverb mix)
- Master level

**Preset Operations:**
- **Save:** Auto-detects and shows "Override" if name exists
- **Load:** Select from dropdown and click "📂 Load"
- **Delete:** Select preset and click "🗑️ Delete"
- **Export:** Download as `audio-presets.json`
- **Import:** Upload JSON; duplicates auto-renamed

Data stored in `localStorage` under key `audioPresets`.

## Project Structure
```
index.html                    # Main UI
css/
  pico.min.css               # Pico.css framework
  pico.colors.min.css        # Color extension
  custom.css                 # Custom styles
js/
  script.js                  # Web Audio engine & UI logic
  mermaid.min.js            # Flowchart rendering library
  audio-presets.json        # Default presets (optional)
README.md
```

## Signal Flow
```
OSC1 (Frequency, Waveform) ──┐
                              ├─→ Gain (Level) → Panner (Stereo) → Analyzer → LPF
OSC2 (Frequency, Waveform) ──┤                                      ↓
                              ├─────────────────────────────────→ LPF
                              ↓
                        HPF → [Distortion] → [Delay] → [Reverb] → Master Gain → Master Analyzer → 🔊 Destination

LFO1 ↷ modulates OSC1 frequency
LFO2 ↷ modulates OSC2 frequency
```

## Tech Stack

- **Web Audio API:** OscillatorNode, GainNode, StereoPannerNode, BiquadFilterNode, WaveShaperNode, DelayNode, ConvolverNode, AnalyserNode
- **Web MIDI API:** MIDI device enumeration, note on/off, control change (CC1 modulation wheel) handling
- **UI Framework:** Pico.css
- **Visualization:** Mermaid.js (flowchart rendering)
- **Data Storage:** localStorage
- **Browser APIs:** Canvas (waveform drawing), Fetch (preset loading)

## Notes

- **Audio Context:** Starts/resumes only after user interaction (required by browser autoplay policies)
- **Smooth Parameter Changes:** Ramping applied to reduce audio artifacts (clicks/pops)
- **Wet/Dry Mixing:** All effects support bypass mixing for blending processed and dry signals
- **Real-time Modulation:** LFO changes apply immediately without audio artifacts
- **CORS:** Preset JSON loading may fail when opening `index.html` directly (file://); use a local server

## Credits

- **UI:** [Pico.css](https://picocss.com/)
- **Flowchart:** [Mermaid.js](https://mermaid.js.org/)
- **Web Audio API:** MDN Documentation
- **Original Concept:** Michel Buffa (michel.buffa@univ-cotedazur.fr)

## License

GPL‑3.0‑or‑later
[LICENSE document](LICENSE.md)

