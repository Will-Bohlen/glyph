import * as Tone from 'tone';
import * as songHandler from "./songHandler";
import { threeHandler } from "./threeHandler";


const document = window.document as Document;
const playButton = document.getElementById("play-button") as HTMLButtonElement;
const landing = document.getElementById("landing") as HTMLDivElement;
const loading = document.getElementById("loading") as HTMLDivElement;

let three = new threeHandler();

document.addEventListener("load", () => {
    Tone.Transport.stop();
    Tone.Transport.bpm.value = 120
})


playButton.addEventListener("click", () => {
  if (Tone.Transport.state !== 'started') {
    Tone.start();
    Tone.Transport.start();
    three.init();
    songHandler.init(three);
    landing.hidden = true;
    loading.hidden = false;
  }
});

//songGen.transposition = 7;

function updateLoop() {
    window.requestAnimationFrame(() => {
        if (!loading.hidden && three.initComplete) loading.hidden = true;
        songHandler.update();
        updateLoop();
    });
}

updateLoop();