import * as THREE from 'three';
import {OrbitControls} from "./OrbitControls.js";

const renderer = new THREE.WebGLRenderer( {antialias: true});
const render_w = 640;
const render_h = 480;
renderer.setSize( render_w, render_h );
renderer.setViewport( 0, 0, render_w, render_h );

const container = document.getElementById( 'myContainer' );

container.appendChild( renderer.domElement );

// camera setting
const camera = new THREE.PerspectiveCamera( 45, render_w/render_h, 1, 500 );
camera.position.set( 0, 0, -100 );
camera.up.set(0, 1, 0);
camera.lookAt( 0, 0, 20 );
//화각이 더 넓어짐 = 물체가 더 작게 보인다
camera.fov = 90;
camera.updateProjectionMatrix();

const controls = new OrbitControls( camera, renderer.domElement );


// geometry setting
const points = [
    10, 0, 0,
    -10, 0, 0,
    0, 0, 10,
    0, 0, -10,
    10, 15, 0,
    -10, 15, 0,
    0, 15, -10,
    0, 15, 10
];

const triIndices = [
    3, 0, 2,         2, 1, 3,
    0, 3, 4,         3, 6, 4,
    6, 3, 1,         1, 5, 6,
    5, 1, 2,         2, 7, 5,
    7, 2, 0,         0, 4, 7,
    7, 4, 6,         6, 5, 7

]

const geometry = new THREE.BufferGeometry();
const pointsArray = new Float32Array(points);
//geometry.setFromPoints()
geometry.setAttribute('position', new THREE.BufferAttribute( pointsArray, 3 ));
geometry.setIndex(triIndices);

// material setting
const material = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: false } );

// line model 
const myMesh = new THREE.Mesh( geometry, material );
//myMesh.position.set(20, 0, 0);
//myMesh.matrix = 
//myMesh.position.z = -10
// create my world (scene)
const myScene = new THREE.Scene();

myScene.add( myMesh );
animate();

function animate() {
    requestAnimationFrame( animate );
    
    controls.update();
    renderer.render( myScene, camera );
}

// register event-callback functions into renderer's dom
renderer.domElement.style = "touch-action:none";
renderer.domElement.onpointerdown = mouseDownHandler;
renderer.domElement.onpointermove = mouseMoveHandler;
renderer.domElement.onpointerup = mouseUpHandler;
renderer.domElement.onpointercancel = mouseUpHandler;
renderer.domElement.onpointerout = mouseUpHandler;
renderer.domElement.onpointerleave = mouseUpHandler;

function compute_pos_ss2ws(x_ss, y_ss) {
    return new THREE.Vector3( x_ss / render_w * 2 - 1, -y_ss / render_h * 2 + 1, -1 ).unproject( camera );
}

let mouse_btn_flag = false;
function mouseDownHandler(e) {
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
  if(e.pointerType == 'mouse') {
    mouse_btn_flag = true;

    console.log("Mouse down ^^");

    // to do //
    //myMesh.position.set(10, 0, 0);
    //myMesh.scale.set(2, 2, 2);
    
    //myModel.quaternion
    //myMesh.setRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4));
    //myMesh.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    //.matrix==localTransform
    const matLocal = new THREE.Matrix4();
    //const matT = new THREE.Matrix4().makeTranslation(10, 0, 0);
    const matS = new THREE.Matrix4().makeScale(2, 2, 2);
    //const matR = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    //matLocal.premultiply(matT);
    matLocal.premultiply(matS);
    //matLocal.premultiply(matR); //matLocal = matT * matLocal, .multiPlay == matLocal = matLocal * matT
    myMesh.matrix = matLocal.clone();
    myMesh.matrixAutoUpdate = false;

    mouseMoveHandler(e);
  }
  else if(e.pointerType == 'touch') {
    evCache.push(e);
    console.log("pointerDown", e);
  }
}

var evCache = new Array();
var prevDiff = -1;
function remove_event(ev) {
  // Remove this event from the target's cache
  for (var i = 0; i < evCache.length; i++) {
    if (evCache[i].pointerId == ev.pointerId) {
      evCache.splice(i, 1);
      break;
    }
  }
 }

function mouseUpHandler(e) {
  mouse_btn_flag = false;
  //console.log("Mouse Up");
  if(e.pointerType != 'touch') return;
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttonlog(ev.type, ev);
  // Remove this pointer from the cache and reset the target's
  // background and border
  remove_event(e);
  // If the number of pointers down is less than two then reset diff tracker
  if (evCache.length < 2) {
    prevDiff = -1;
  }
}

let x_prev = render_w / 2;
let y_prev = render_h / 2;
function mouseMoveHandler(e) {
  if(e.pointerType == 'mouse') {
    if(mouse_btn_flag) {
      let posNp = compute_pos_ss2ws(e.clientX, e.clientY);
      // to do //
      //console.log("Mouse Pos:", e.clientX, e.clientY);
      //console.log("Mouse Pos:", posNp);

      x_prev = e.clientX;
      y_prev = e.clientY;
    }
  }
  else if(e.pointerType == 'touch') {
    console.log("pointerMove", e);
    //e.target.style.border = "dashed";

    // Find this event in the cache and update its record with this event
    for (var i = 0; i < evCache.length; i++) {
      if (e.pointerId == evCache[i].pointerId) {
        evCache[i] = e;
        break;
      }
    }

    if (evCache.length == 1) {
      // to do //
      let posNp = compute_pos_ss2ws(e.clientX, e.clientY);
      console.log("Mouse Pos:", posNp);
      

      x_prev = e.clientX;
      y_prev = e.clientY;
    }
    // If two pointers are down, check for pinch gestures
    else if (evCache.length == 2) {
      console.log("Pinch moving");
      // Calculate the distance between the two pointers
      var curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

      if (prevDiff > 0) {
        if (curDiff > prevDiff) {
          // The distance between the two pointers has increased
          console.log("Pinch moving OUT -> Zoom in", e);
          camera.near += 2.0;
          camera.near = Math.min(camera_ar.near, camera_ar.far);
          camera.updateProjectionMatrix();
        }
        if (curDiff < prevDiff) {
          // The distance between the two pointers has decreased
          console.log("Pinch moving IN -> Zoom out",e);
          camera.near -= 2.0;
          camera.near = Math.max(camera_ar.near, 1.0);
          camera.updateProjectionMatrix();
        }
        
      }
      // Cache the distance for the next move event
      prevDiff = curDiff;
    }
    e.preventDefault();
  }
}
