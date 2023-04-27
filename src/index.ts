import * as Tone from 'tone';
//const THREEx = require(ß'@ar-js-org/ar.js/three.js/build/ar.js');
import { threeTest} from "./threeTest";
import * as Synth from "./synth";
import { melodicGen } from './melodicGen';

const document = window.document as Document;
const playButton = document.getElementById("play-button") as HTMLButtonElement;
const landing = document.getElementById("landing") as HTMLDivElement;

let three = new threeTest();

document.addEventListener("load", () => {
    Tone.Transport.stop();
    Tone.Transport.bpm.value = 120
})


playButton.addEventListener("click", () => {
  if (Tone.Transport.state !== 'started') {
    playButton.textContent = "Pause"
    Tone.start();
    Tone.Transport.start();
    three.init();
    landing.hidden = true;
  } else {
    playButton.textContent = "Play"
    Tone.Transport.stop();
  }
});

const songGen = new melodicGen(Synth.humanPluck);
const songGen2 = new melodicGen(Synth.triSynth);
songGen.transposition = 7;

function updateLoop() {
    window.requestAnimationFrame(() => {
        songGen.update();
        songGen2.update();
        songGen.active = three.barcode7Root.visible;
        songGen2.active = three.barcode23Root.visible;
        updateLoop();
    });
}

updateLoop();