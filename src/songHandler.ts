import * as Synth from "./synth";
import { noteGen, melodicGen, droneGen, chordGen } from './noteGen';
import seedrandom from "seedrandom";


const scaleMajor =  ['C4', 'D4', 'E4',  'F4',  'G4', 'A4',  'B4',  'C5'];
const scaleMinor =  ['C4', 'D4', 'Eb4', 'F4',  'G4', 'Ab4', 'Bb4', 'C5'];
const scaleLydian = ['C4', 'D4', 'E4',  'F#4', 'G4', 'A4',  'B4',  'C5'];
const scaleDorian = ['C4', 'D4', 'Eb4', 'F4',  'G4', 'A4',  'Bb4', 'C5'];
const scales = [scaleMajor, scaleMinor, scaleLydian, scaleDorian];

const keyInterval = 32;

let three;

let chords;
let bass;
let pluck;
let tri;
let drone;
let synths = [] as Array<noteGen>;

let currentScale = scaleMinor;
let keyTransposition = 0;

let currentTime
let currentSecond;

export function init(threeInstance) {
    three = threeInstance;

    chords = new chordGen(Synth.squareChords, three.barcode02);

    bass = new chordGen(Synth.triBass, three.barcode07);
    bass.bassOnly = true;
    bass.transposition = -24;

    pluck = new melodicGen(Synth.humanPluck, three.barcode17);

    drone = new droneGen(Synth.lowDrone, three.barcode23);
    drone.transposition = -36;
    
    tri = new melodicGen(Synth.triSynth, three.barcode37);
    tri.transposition = 12;

    synths = [chords, bass, pluck, drone, tri] as Array<noteGen>;
    for (let synth of synths) {
        synth.scale = currentScale;
        synth.keyTransposition = keyTransposition;
    }

    
    currentTime = new Date().getTime();
    currentSecond = Math.floor(currentTime / 1e3);
    newKey(currentSecond - currentSecond % keyInterval);
}

export function update() {

    for (let synth of synths) {
        synth.update();
        synth.scale = currentScale;
        synth.keyTransposition = keyTransposition;
    }

    currentTime = new Date().getTime();
    let lastSecond = currentSecond;
    currentSecond = Math.floor(currentTime / 1e3);
    if (lastSecond != currentSecond) {
        if (currentSecond % keyInterval == 0) {
            newKey(currentSecond);
        }
        for (let synth of synths) { synth.secondTick(currentSecond); }
    }
}

function newKey(currentSecond) {
    let rng = seedrandom((currentSecond / 100).toString());
    let rng2 = seedrandom((currentSecond / 101).toString());

    keyTransposition = Math.floor(rng() * 12);
    currentScale = scales[Math.floor(rng2() * 4)];
    console.log("New key: ", currentScale);
}