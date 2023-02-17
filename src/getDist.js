import * as Tone from 'tone';
import unmute from './unmute';


// import this on your HTML
window.addEventListener('load', () => {

    // Create an audio context instance if WebAudio is supported
    let context = (window.AudioContext || window.webkitAudioContext) ?
    new (window.AudioContext || window.webkitAudioContext)() : null;
    
    // Decide on some parameters
    let allowBackgroundPlayback = false; // default false, recommended false
    let forceIOSBehavior = false; // default false, recommended false
    // Pass it to unmute if the context exists... ie WebAudio is supported
    if (context)
    {
    // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
    // if you don't need to do that (most folks won't) then you can simply ignore the return value
    unmute(context, allowBackgroundPlayback, forceIOSBehavior);
    }

    const camera = document.querySelector('[camera]');
    const marker = document.querySelector('a-marker');
    let check;

    const synth = new Tone.Synth({
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
    }).toDestination();

    synth.volume.minValue = -50;
    synth.volume.maxValue = 0;

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