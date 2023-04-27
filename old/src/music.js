import Tone;

Tone.Transport.stop();
Tone.Transport.bpm.value = 150

document.getElementById("play-button").addEventListener("click", function() {
  if (Tone.Transport.state !== 'started') {
    Tone.start();
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
  }
});

const triVib = new Tone.Vibrato(4, 0.2).toDestination();
const triSynth = new Tone.Synth({
    volume: -5,
    oscillator: {
        type: 'triangle'
    },
    envelope: {
        attack: 0.005,
        decay: 0.14,
        sustain: 0.1,
        release: 0.231
    }
}).connect(triVib);

const amSynth = new Tone.AMSynth().toDestination();

triSynth.triggerAttackRelease("C5", "2n");