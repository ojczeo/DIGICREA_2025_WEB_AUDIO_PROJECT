# Web Audio Synth: Two Oscillators + LFO, Filters, and Effects

A simple browser-based synthesizer built with the Web Audio API. It features two oscillators, LFO modulation, basic filters (HPF/LPF), effects (Distortion, Delay, Reverb), master level control, and a lightweight preset system (save/load/export/import via `localStorage`). The UI is styled with Pico.css.

## Features
- Two oscillators: independent frequency and waveform (`sine`, `square`, `sawtooth`, `triangle`)
- Per-oscillator LFO: toggle and frequency control
- Filters: High-Pass (HPF) and Low-Pass (LPF)
- Effects: Distortion (amount), Delay (time, feedback), Reverb (mix)
- Master level: global output volume
- Controls: mouse modulation and keyboard notes (W, X, C, V)
- Presets: save/load/delete, export to JSON, import from JSON; defaults auto-loaded from `js/audio-presets.json` if empty
- Help modal: in-app usage guide

## Getting Started

### Prerequisites
- A modern browser supporting the Web Audio API (Chrome, Edge, Firefox, Safari)

### Open Online
The app is hosted via GitHub Pages:

https://ojczeo.github.io/DIGICREA_2025_WEB_AUDIO_PROJECT/

### Run Locally
The app can be opened directly, but preset loading from JSON uses `fetch`, which usually requires serving via HTTP. For best results, use a local server:

Option 1 (Node, if installed):
```bash
cd "DIGICREA_2025_WEB_AUDIO_PROJECT"
npx serve -p 8000
```

Option 2

Just open `index.html` in a web browser.

If you choose to double-click `index.html` (file://), audio works, but default presets might not load due to fetch/CORS restrictions.

Option 3 (VS Code): use the Live Server extension and open `index.html`.

## Usage
1. Click "Click to start audio" to initialize/resume the audio context.
2. Toggle Keyboard Control to enable note keys: W, X, C, V.
3. Toggle Mouse Control to modulate: horizontal = LFO freq, vertical = Osc 1 freq.
4. Adjust oscillator waveforms and frequencies, enable/disable LFOs.
5. Shape tone with HPF/LPF. Add effects: Distortion, Delay, Reverb.
6. Use Master Level to set output volume.

## Presets
- Save: enter a name and click Save (button shows "Override" if the name exists).
- Load: pick a preset from the dropdown and click Load.
- Delete: select a preset and click Delete.
- Export: Download all presets as `audio-presets.json`.
- Import: Upload a JSON file; duplicates are auto-renamed.
- Defaults: when `localStorage` is empty, the app tries to fetch `js/audio-presets.json` and load defaults.

Data is stored in `localStorage` under the key `audioPresets`.

## Project Structure
```
index.html
css/
  pico.min.css
js/
  audio-presets.json
  script.js
```
- `index.html`: UI layout and controls
- `css/pico.min.css`: Pico.css stylesheet
- `js/script.js`: Web Audio graph, UI bindings, preset logic
- `js/audio-presets.json`: optional defaults loaded at startup (if `localStorage` is empty)

## Tech Notes
- Built with the Web Audio API: oscillators, biquad filters, delay (feedback loop), reverb (generated impulse response), distortion (waveshaper), wet/dry routing, and master gain.
- Audio starts/resumes only after a user gesture (click/toggle). Browsers block autoplay.
- Some parameter changes (e.g., delay time) use smoothing to reduce clicks.

## Troubleshooting
- Presets not loading: run via a local HTTP server (see above) so `fetch('js/audio-presets.json')` succeeds.
- No sound after load: click the Start button to resume the audio context. Some browsers (especially Safari) require explicit interaction.
- Mouse control inactive: ensure Mouse Control toggle is enabled and focus is not on an input/select.

## Credits
- UI: [Pico.css](https://picocss.com/)
- Audio: Web Audio API (MDN docs)
- Michel Buffa: basic sketch of the app (michel.buffa@univ-cotedazur.fr)

## License
Educational project; license TBD.
