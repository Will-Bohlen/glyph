import * as Tone from 'tone';
import seedrandom from 'seedrandom';

const scaleMajor =  ['C4', 'D4', 'E4',  'F4',  'G4', 'A4',  'B4',  'C5'];
const scaleMinor =  ['C4', 'D4', 'Eb4', 'F4',  'G4', 'Ab4', 'Bb4', 'C5'];
const scaleLydian = ['C4', 'D4', 'E4',  'F#4', 'G4', 'A4',  'B4',  'C5'];
const scaleDorian = ['C4', 'D4', 'Eb4', 'F4',  'G4', 'A4',  'Bb4', 'C5'];

export class melodicGen {

    currentTime = 0;
    currentSecond = 0;

    scale = scaleMajor;
    transposition = 0;

    active = false;
    synth;

    constructor(synth) {
        this.synth = synth;
    }

    update() {
        this.currentTime = new Date().getTime();
        let lastSecond = this.currentSecond;
        this.currentSecond = Math.floor(this.currentTime / 1e3);
        if (lastSecond != this.currentSecond) this.secondTick();
    }

    private secondTick() {
        if (Tone.Transport.state == "started" && this.active) {
            // Set up seeded RNG
            let rng1 = seedrandom(this.currentSecond.toString());
            let rng2 = seedrandom((this.currentSecond / 2).toString());
            let rng3 = seedrandom((this.currentSecond / 3).toString());
            let rng4 = seedrandom((this.currentSecond / 4).toString());

            // Select rhythms (50% chance of playing on each eighth note)
            let playNote1 = rng1() > 0.5; 
            let playNote2 = rng2() > 0.5;

            let pitch;
            let freq;

            // Calculate pitch for each note and play
            if (playNote1) {
                pitch = this.scale[(Math.floor(rng3() * this.scale.length) + this.transposition) % this.scale.length]; 
                freq = Tone.Frequency(pitch).transpose(this.transposition).toFrequency();
                this.synth.triggerAttackRelease(freq, "8n", "+0");
            }
            if (playNote2) {
                pitch = this.scale[Math.floor(rng4() * this.scale.length)]; 
                freq = Tone.Frequency(pitch).transpose(this.transposition).toFrequency();
                this.synth.triggerAttackRelease(freq, "8n", "+0.5");
            }
        }
    }
}