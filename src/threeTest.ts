import * as THREE from 'three';
const THREEx = require('@ar-js-org/ar.js/three.js/build/ar-threex.js');

declare global {
    interface Window {
        arToolkitSource:any;
        arToolkitContext:any;
        arMarkerControls:any;
    }
}

export class threeTest {

    arToolkitSource;
    renderer;
    onRenderFcts = [] as Array<Function>;
    arToolkitContext;
    arMarkerControls;
    scene;
    camera;
    barcode7Root= new THREE.Group;;
    barcode23Root= new THREE.Group;;

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

        this.barcode7Root = new THREE.Group;
        this.barcode7Root.name = 'barcode7'
        this.scene.add(this.barcode7Root);

        this.barcode23Root = new THREE.Group;
        this.barcode23Root.name = 'barcode23'
        this.scene.add(this.barcode23Root);}

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
            });
            window.arToolkitSource = this.arToolkitSource;
            setTimeout(() => {
                this.onResize()
            }, 2000);
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

        // MARKER
        this.arMarkerControls = new THREEx.ArMarkerControls(this.arToolkitContext, this.barcode7Root, {
            type: 'barcode',
            barcodeValue: 7,
            // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
            // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        })
        this.arMarkerControls = new THREEx.ArMarkerControls(this.arToolkitContext, this.barcode23Root, {
            type: 'barcode',
            barcodeValue: 23,
            // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
            // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        })

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

        // add a torus knot
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = geometry.parameters.height / 2
        this.barcode7Root.add(mesh);
        this.barcode23Root.add(mesh.clone());

        var geometry2 = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
        var material = new THREE.MeshNormalMaterial();
        var mesh2 = new THREE.Mesh(geometry2, material);
        mesh2.position.y = 0.5
        this.barcode7Root.add(mesh2);
        let mesh2b = mesh2.clone();
        this.barcode23Root.add(mesh2b);

        this.onRenderFcts.push(function (delta) {
            mesh2.rotation.x += Math.PI * delta
            mesh2b.rotation.x += Math.PI * delta
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