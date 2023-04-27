const Tone = require("../node_modules/tone/build/Tone.js");

// import this on your HTML
window.addEventListener('load', () => {


    const camera = document.querySelector('[camera]');
    const marker = document.querySelector('a-marker');
    let check;

    const synth = new Tone.MonoSynth().toDestination();
    
    synth.set({
        envelope : {
            attack: 2,
            decay: 0,
            sustain: 1,
            release: 2
        },
        oscillator : {
            type: "sine"
        },
        volume: -20
    });

    if (marker) {
        marker.addEventListener('markerFound', () => {
            let cameraPosition = camera.object3D.position;
            let markerPosition = marker.object3D.position;
            let distance = cameraPosition.distanceTo(markerPosition)
            console.log(markerPosition);

            synth.context.resume();
            synth.triggerAttack("C4", Tone.now());

            check = setInterval(() => {
                cameraPosition = camera.object3D.position;
                markerPosition = marker.object3D.position;
                distance = cameraPosition.distanceTo(markerPosition)
                
                synth.volume.value = -distance * 3;

                // do what you want with the distance:
            }, 40);
        });

        marker.addEventListener('markerLost', () => {
            clearInterval(check);
            synth.triggerRelease();
        })
    }
})