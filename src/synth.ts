import * as Tone from 'tone';

export const triSynth = new Tone.Synth({
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
});
const triVib = new Tone.Vibrato(4, 0.2);

const triDelay = new Tone.PingPongDelay({
    delayTime: "16n", 
    feedback: 0.7,
    wet: 0.6
});

triSynth.chain(triVib, triDelay, Tone.Destination);



export const humanPluck = new Tone.DuoSynth({
    volume: -10,
    voice0: {
        oscillator: {type: "sine"}
    },
    voice1: {
        oscillator: {type: "square"}
    },
    harmonicity: 6
});

const humanEnv = new Tone.AmplitudeEnvelope({
    attack: 0.3,
    decay: 1,
    sustain: 0.6,
    release: 0.006
})

const humanFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 3012,
    Q: 0.27
})

humanPluck.voice0.envelope.set(humanEnv.get());
humanPluck.voice1.envelope.set(humanEnv.get());
humanPluck.voice0.filterEnvelope.set(humanEnv.get());
humanPluck.voice1.filterEnvelope.set(humanEnv.get());
humanPluck.voice0.filter.set(humanFilter.get());
humanPluck.voice1.filter.set(humanFilter.get());


const humanDelay = new Tone.PingPongDelay({
    delayTime: "8n", 
    feedback: 0.6,
    wet: 0.5
});

humanPluck.chain(humanDelay, Tone.Destination);



export const lowDrone = new Tone.MonoSynth({
    volume: -15,
    oscillator: { type: 'sawtooth' },
    envelope: {
        attack: 1,
        release: 1
    },
    filter: {
        type: "lowpass",
        frequency: 1500,
        Q: 10
    }
}).toDestination();

const droneLFO = new Tone.LFO("0.125n", 0, 1500).start();
droneLFO.connect(lowDrone.filter.frequency);


export const squareChords = new Tone.PolySynth(Tone.Synth, {
    volume: -17,
    oscillator: { 
        type: 'fatsquare'
    },
    envelope: {
        attack: 2,
        sustain: 1,
        release: 4
    }
}).toDestination();

export const triBass = new Tone.Synth({
    volume: -8,
    oscillator: { type: 'triangle' }
}).toDestination();

export const currentSynth = squareChords;


