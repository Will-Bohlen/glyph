import * as Tone from 'tone';
import seedrandom from 'seedrandom';


export abstract class noteGen {
    scale;
    keyTransposition = 0;
    transposition = 0;

    active = false;
    synth;
    barcode;

    constructor(synth, barcode) {
        this.synth = synth;
        barcode;
        this.barcode = barcode;
    }

    update() {
        this.active = this.barcode.group.visible;
    }

    secondTick(currentSecond) {};
}

export class melodicGen extends noteGen {
    constructor(synth, barcode) {
        super(synth, barcode);
    }

    update() {
        this.active = this.barcode.group.visible;
    }

    secondTick(currentSecond) {
        if (Tone.Transport.state == "started" && this.active) {
            // Set up seeded RNG
            let rng1 = seedrandom(currentSecond.toString());
            let rng2 = seedrandom((currentSecond / 2).toString());
            let rng3 = seedrandom((currentSecond / 3).toString());
            let rng4 = seedrandom((currentSecond / 4).toString());

            // Select rhythms (50% chance of playing on each eighth note)
            let playNote1 = rng1() > 0.5; 
            let playNote2 = rng2() > 0.5;

            let pitch;
            let freq;

            // Calculate pitch for each note and play
            if (playNote1) {
                pitch = this.scale[(Math.floor(rng3() * this.scale.length)) % this.scale.length]; 
                freq = Tone.Frequency(pitch).transpose(this.transposition + this.keyTransposition).toFrequency();
                this.synth.triggerAttackRelease(freq, "8n", "+0");
            }
            if (playNote2) {
                pitch = this.scale[Math.floor(rng4() * this.scale.length) % this.scale.length]; 
                freq = Tone.Frequency(pitch).transpose(this.transposition + this.keyTransposition).toFrequency();
                this.synth.triggerAttackRelease(freq, "8n", "+0.5");
            }
        }
    }
}

export class droneGen extends noteGen {
    currentTrans = -1;
    isPlaying = false;

    constructor(synth, barcode) {
        super(synth, barcode);
    }

    update() {
        this.active = this.barcode.group.visible;

        if (Tone.Transport.state == "started" && this.active) {
            if (this.currentTrans != this.keyTransposition || !this.isPlaying) {
                this.currentTrans = this.keyTransposition;
    
                let pitch;
                let freq;

                pitch = this.scale[0]; 
                freq = Tone.Frequency(pitch).transpose(this.transposition + this.keyTransposition).toFrequency();

                if (this.isPlaying) this.synth.triggerRelease("+0");
                this.synth.triggerAttack(freq, "+0");

                this.isPlaying = true;
            }
        }
        if (this.isPlaying && !this.active) {
            this.synth.triggerRelease("+0");
            this.isPlaying = false;
        }
    }
}

export class chordGen extends noteGen {
    currentChord = [] as Array<Tone.FrequencyClass>;
    isPlaying = false;
    bassOnly = false;

    constructor(synth, barcode) {
        super(synth, barcode);
    }

    update() {
        this.active = this.barcode.group.visible;

        if (this.isPlaying && !this.active) {
            this.release();
            this.isPlaying = false;
            this.currentChord = [];
        }
    }

    secondTick(currentSecond) {
        if (currentSecond % 4 == 0) this.newChord(currentSecond)
        else if (!this.isPlaying && this.active) {
            this.newChord(currentSecond - currentSecond % 4);
        }
    }

    newChord(currentSecond) {
        if (Tone.Transport.state == "started" && this.active) {
            if (this.isPlaying) this.release();

            let rng = seedrandom((currentSecond / 10).toString());
            let offset = Math.floor(rng() * 7);
            let chord = [this.scale[(0 + offset) % 7], this.scale[(2 + offset) % 7], this.scale[(4 + offset) % 7]]; 
            let chordFreqs = [] as Array<Tone.FrequencyClass>;
    
            for (let i = 0; i < chord.length; i++) {
                chordFreqs.push(Tone.Frequency(chord[i]).transpose(this.transposition + this.keyTransposition))
                if (chordFreqs[i] < chordFreqs[0]) chordFreqs[i] = chordFreqs[i].transpose(12);
            }

            chordFreqs[1] = chordFreqs[1].transpose(-12);

            if (this.bassOnly) this.synth.triggerAttack(chordFreqs[0]);
            else this.synth.triggerAttack(chordFreqs, "+0");
            this.isPlaying = true;
            this.currentChord = chordFreqs;
        }
    }

    release() {
        if (this.bassOnly) this.synth.triggerRelease("+0");
        else this.synth.triggerRelease(this.currentChord, "+0")
    }
}