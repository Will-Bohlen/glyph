import * as THREE from 'three';
const THREEx = require('@ar-js-org/ar.js/three.js/build/ar-threex.js');

declare global {
    interface Window {
        arToolkitSource:any;
        arToolkitContext:any;
        arMarkerControls:any;
    }
}

class barcode {
    number = 0;
    group = new THREE.Group;
    name = ""
    color = new THREE.Color('white');

    constructor(number, color) {
        this.number = number;
        this.color = color;
        this.name = "barcode" + (number < 10 ? "0" : "") + number; 
    }
}

export class threeHandler {

    arToolkitSource;
    renderer;
    onRenderFcts = [] as Array<Function>;
    arToolkitContext;
    arMarkerControls;
    scene;
    camera;
    initComplete = false;

    // 02, 07, 17, 23, 37, 43, 54, 59
    barcode02 = new barcode(2, new THREE.Color( 'aquamarine' ));
    barcode07 = new barcode(7, new THREE.Color( 'blue' ));
    barcode17 = new barcode(17, new THREE.Color( 'coral' ));
    barcode23 = new barcode(23, new THREE.Color( 'darkolivegreen' ));
    barcode37 = new barcode(37, new THREE.Color( 'darkorchid' ));
    barcode43 = new barcode(43, new THREE.Color( 'gold' ));
    barcode54 = new barcode(54, new THREE.Color( 'white' ));
    barcode59 = new barcode(59, new THREE.Color( 'black' ));
    barcodes = [this.barcode02, this.barcode07, this.barcode17, this.barcode23, this.barcode37, this.barcode43, this.barcode54, this.barcode59];

    //////////////////////////////////////////////////////////////////////////////////
    //		Init
    //////////////////////////////////////////////////////////////////////////////////
    constructor() {
        // init renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        this.renderer.setSize(640, 480);
        this.renderer.domElement.style.position = 'absolute'
        this.renderer.domElement.style.top = '0px'
        this.renderer.domElement.style.left = '0px'

        // init scene and camera
        this.scene = new THREE.Scene();
        this.scene.visible = false;

        //////////////////////////////////////////////////////////////////////////////////
        //		Initialize a basic camera
        //////////////////////////////////////////////////////////////////////////////////

        // Create a camera
        this.camera = new THREE.PerspectiveCamera();
        this.scene.add(this.camera);

        for (let bc of this.barcodes) {
            bc.group.name = bc.name;
            bc.group.visible = false;
            this.scene.add(bc.group); 
        }
    }

    init() {
        document.body.appendChild(this.renderer.domElement);
        ////////////////////////////////////////////////////////////////////////////////
        //          handle arToolkitSource
        ////////////////////////////////////////////////////////////////////////////////

        this.arToolkitSource = new THREEx.ArToolkitSource({
            // to read from the webcam
            sourceType: 'webcam',

            sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
            sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,

            // // to read from an image
            // sourceType : 'image',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

            // to read from a video
            // sourceType : 'video',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
        })

        this.prepareRender()

        this.arToolkitSource.init(() => {
            this.arToolkitSource.domElement.addEventListener('canplay', () => {
                console.log(
                    'canplay',
                    'actual source dimensions',
                    this.arToolkitSource.domElement.videoWidth,
                    this.arToolkitSource.domElement.videoHeight
                );

                this.initARContext();
                this.initComplete = true;
            });
            window.arToolkitSource = this.arToolkitSource;
            setTimeout(() => {
                this.onResize()
            }, 500);
        });
        

        // handle resize
        window.addEventListener('resize', () => {
            this.onResize()
        })
    }

    private onResize() {
        this.arToolkitSource.onResizeElement()
        this.arToolkitSource.copyElementSizeTo(this.renderer.domElement)
        if (window.arToolkitContext.arController !== null) {
            this.arToolkitSource.copyElementSizeTo(window.arToolkitContext.arController.canvas)
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    //          initialize arToolkitContext
    ////////////////////////////////////////////////////////////////////////////////


    private initARContext() { // create atToolkitContext
        this.arToolkitContext = new THREEx.ArToolkitContext({
            //cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
            detectionMode: 'color_and_matrix',
            matrixCodeType: '3x3'
        })
        // initialize it
        this.arToolkitContext.init(() => { // copy projection matrix to camera
            this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());

            this.arToolkitContext.arController.orientation = this.getSourceOrientation();
            this.arToolkitContext.arController.options.orientation = this.getSourceOrientation();

            console.log('arToolkitContext', this.arToolkitContext);
            window.arToolkitContext = this.arToolkitContext;
        })

        // Add Markers
        for (let bc of this.barcodes) {
            this.arMarkerControls = new THREEx.ArMarkerControls(this.arToolkitContext, bc.group, {
                type: 'barcode',
                barcodeValue: bc.number,
            })
        }

        console.log('ArMarkerControls', this.arMarkerControls);
        window.arMarkerControls = this.arMarkerControls;
        this.scene.visible = true;
    }


    private getSourceOrientation() {
        if (!this.arToolkitSource) {
            return null;
        }

        console.log(
            'actual source dimensions',
            this.arToolkitSource.domElement.videoWidth,
            this.arToolkitSource.domElement.videoHeight
        );

        if (this.arToolkitSource.domElement.videoWidth > this.arToolkitSource.domElement.videoHeight) {
            console.log('source orientation', 'landscape');
            return 'landscape';
        } else {
            console.log('source orientation', 'portrait');
            return 'portrait';
        }
    }

    private prepareRender() {
        // update artoolkit on every frame
        this.onRenderFcts.push(() => {
            if (!this.arToolkitContext || !this.arToolkitSource || !this.arToolkitSource.ready) {
                return;
            }

            this.arToolkitContext.update(this.arToolkitSource.domElement)

            // update scene.visible if the marker is seen
            //this.scene.visible = true //this.camera.visible
        })

        //////////////////////////////////////////////////////////////////////////////////
        //		add an object in the scene
        //////////////////////////////////////////////////////////////////////////////////    

        var octaGeo = new THREE.OctahedronGeometry(0.35);
        var octaMaterial = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.4
        });
        var octaMesh = new THREE.Mesh(octaGeo, octaMaterial);


        var octaMeshes = [] as Array<THREE.Mesh>;
        var ringMeshes = [] as Array<THREE.Mesh>;

        for (let bc of this.barcodes) {
            var ringGeo = new THREE.RingGeometry(0.5, 1, 4);
            var ringMaterial = new THREE.MeshStandardMaterial({
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                emissive: bc.color
            });
            var ringMesh = new THREE.Mesh(ringGeo, ringMaterial);
            ringMesh.rotateX(90);
            

            var thisOcta = octaMesh.clone();
            octaMeshes.push(thisOcta);
            ringMeshes.push(ringMesh);

            octaMesh.rotateY(bc.number);
            ringMesh.rotateZ(bc.number);

            bc.group.add(thisOcta);
            bc.group.add(ringMesh);
            
        }

        this.onRenderFcts.push(function (delta) 
        {
            for (let octa of octaMeshes) {
                octa.rotation.y -= Math.PI * delta * 0.05;
            }
            for (let ring of ringMeshes) {
                ring.rotation.z += Math.PI * delta * 0.1;
            }
        })
        //////////////////////////////////////////////////////////////////////////////////
        //		render the whole thing on the page
        //////////////////////////////////////////////////////////////////////////////////

        // render the scene
        
        this.onRenderFcts.push(() => {
            this.renderer.render(this.scene, this.camera);
        })
            // run the rendering loop
        var lastTimeMsec = 0

        const animate = (nowMsec: number) => {
            // keep looping
            requestAnimationFrame(animate);
            // measure time
            lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
            var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
            lastTimeMsec = nowMsec
            // call each update function
            this.onRenderFcts.forEach(function (onRenderFct) {
                onRenderFct(deltaMsec / 1000, nowMsec / 1000)
            })
        };

        requestAnimationFrame(animate);
    }
}