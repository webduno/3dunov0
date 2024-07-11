import {
  initAboutText,
  initDunoText,
  initWebText,
  initArtText,
  initCodeText,
  initGamesText,
  loadIslandSand,
  loadIslandRock,
  loadIslandWater,
  loadIslandMountain,
  loadIslandGreen,
  loadIslandLightGreen,
} from './models.js';
import {
  updateCameraPosition,
} from './helper.js';

import * as THREE from 'three';

const actionsLookup = {
  "about_section": { msg: "Hello World", goToIndex: 1 },
  "art_section": { msg: "Hello World", goToIndex: 2 },
  "code_section": { msg: "Hello World", goToIndex: 3 },
  "game_section": { msg: "Hello World", goToIndex: 4 },
  "contact_section": { msg: "Hello World", goToIndex: 5 },
};


let loadedWater = false,
    totalTimeElapsed = 0,
    tRate = 0.5,
    container,
    camera, scene, raycaster, renderer,
    INTERSECTED, CLICKED, colors, SELECTED, THEINDEX, light, theta = 0,
    orange = false, orangeLevel = 0, orangeDOM, desire = [];

const pointer = new THREE.Vector2();
const radius = 100;
let touchStartTime = 0;

init();
function init() {
  // Function to handle the toggle action
  function handleToggle() {
    document.getElementById("mainToggleContainer").style.display = "none";
    document.getElementById("loadingWater").style.display = "";
    document.getElementById("mainButtons").style.display = "";
    document.body.style.background = "";
    initGame();
    animate();
  }

  // Add event listener for click and touch events
  const mainToggle = document.getElementById("mainToggle");
  mainToggle.addEventListener("click", handleToggle);
  mainToggle.addEventListener("touchstart", () => {
    touchStartTime = new Date().getTime();
  });
  
  mainToggle.addEventListener("touchend", () => {
    let touchEndTime = new Date().getTime();
    let touchDuration = touchEndTime - touchStartTime;
  
    // If the touch duration is less than 200ms, treat it as a tap
    if (touchDuration < 100) {
      handleToggle();
    }
  });
  
  
  
  
  
  
  
  if (window.location.hash === "#game") {
    handleToggle();
  }
}

function initGame() {
  setupCloseButtons();
  setupSceneGotoButtons();
  
  document.addEventListener("mousedown", handleEvent);
  document.addEventListener("touchstart", handleEvent);

  container = document.createElement('div');
  document.body.appendChild(container);

  setupCamera();
  setupScene();
  setupRenderer();
  
  document.addEventListener('mousemove', onPointerMove);
  window.addEventListener('resize', onWindowResize);
}

function setupCloseButtons() {
  document.querySelectorAll('.selfCloseButton').forEach(button => {
    button.onclick = e => {
      e.currentTarget.parentNode.parentNode.parentNode.classList.toggle("none");
    };
  });
}

function setupSceneGotoButtons() {
  document.querySelectorAll('.scene-goto').forEach(scene => {
    scene.onclick = e => {
      let theIndex = parseInt(e.currentTarget.id.replace("scene", ""));
      updateScene(theIndex);
    };
  });
}

function updateScene(theIndex) {
  THEINDEX = theIndex;
  SELECTED = { ...scene.children[theIndex + 1] };
  CLICKED = { ...scene.children[theIndex + 1] };
  INTERSECTED = { ...scene.children[theIndex + 1] };
  
  camera.lookAt(
    SELECTED.position.x + colors[theIndex].camera.lookAt[0],
    SELECTED.position.y + colors[theIndex].camera.lookAt[1],
    SELECTED.position.z + colors[theIndex].camera.lookAt[2]
  );

  document.querySelectorAll('.amodalscreen').forEach(adomscene => {
    if ("modal" + theIndex != adomscene.id) {
      adomscene.className += " none";
    } else {
      // console.log("adomscene", adomscene, theIndex)
    }
  });
  
  const modal = document.getElementById("modal" + theIndex);
  if (modal) { modal.classList.toggle("none"); }
}

function handleEvent(e) {
  if (INTERSECTED && INTERSECTED.name in actionsLookup) {
    if (isModalOpen()) return;
    
    if (INTERSECTED?.material?.emissive) {
      INTERSECTED.material.emissive.setHex(0x000000);
    }

    let theIndex = actionsLookup[INTERSECTED.name].goToIndex;
    if (theIndex == THEINDEX) return;
    updateScene(theIndex);
  }
}

function isModalOpen() {
  return Array.from(document.querySelectorAll('.amodalscreen'))
    .some(adomscene => !adomscene.classList.contains('none'));
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.z = 50;
  camera.lookAt(0, 0, 0);
}

function setupScene() {
  scene = new THREE.Scene();
  addLightsToScene();
  colors = getColors();
  loadIslandWater(scene, onLoadIslandWater);
  addBoxesToScene();
  raycaster = new THREE.Raycaster();
}

function addLightsToScene() {
  light = new THREE.PointLight(0xFFDE9F, 1.5, 100);
  light.position.set(40, 10, 40);
  light.castShadow = true;
  scene.add(light);
  
  light = new THREE.PointLight(0xFFDE9F, 1, 75);
  light.position.set(-15, 5, -50);
  light.castShadow = true;
  scene.add(light);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
}

function getColors() {
  return [
    {
      img: "./img/wp2100821-1187062037.jpg", wireframe: false,
      camera: { pos: [0, 0, 0], lookAt: [0, 0, 0] },
      box: { pos: [0, 0, 0], scale: [0, 0, 0], rot: [0, 0, 0] },
      color: 0xff9999,
    },
    {
      img: "./img/grrrid.jpg", wireframe: false,
      camera: { pos: [30, 30, 90], lookAt: [0, 0, 0] },
      box: { pos: [0, 0, 0], scale: [0, 0, 0], rot: [0, 0, (3.14 / 4) * 3] },
      color: 0xff9999,
    },
    {
      img: "./img/th-1084040338.jpg", wireframe: false,
      camera: { pos: [50, 5, 55], lookAt: [0, 0, 0] },
      box: { pos: [0, 0, 0], scale: [0, 0, 0], rot: [0, 0, 0] },
      color: 0xffcc99,
    },
    {
      img: "./img/th-813177686.jpg", wireframe: false,
      camera: { pos: [-20, -10, 20], lookAt: [0, 0, 0] },
      box: { pos: [0, 0, 0], scale: [0, 0, 0], rot: [0.0, 0, 0] },
      color: 0xffff99,
    },
    {
      img: "./img/grad5.jpg", wireframe: false,
      camera: { pos: [59, 7, -66], lookAt: [0, 0, 0] },
      box: { pos: [0, 0, 0], scale: [0, 0, 0], rot: [0, 0, 0] },
      color: 0xccff99,
    },
    {
      img: "./img/grad5.jpg", wireframe: false,
      camera: { pos: [-20 ,25,5], lookAt: [0, 0, 0] },
      box: { pos: [0, 0, 0], scale: [0, 0, 0], rot: [0, 0, 0] },
      color: 0xccff99,
    },
    











                                
    {
      img:"./img/grad6.jpg",
      wireframe:false,
      camera:{pos:[-40 ,5,-55],lookAt:[0,0,0]},
      box:{pos:[0,0,0],scale:[1,1,1],rot:[0,0,0],},
      color:0x99ffcc,
  },
{
      img:"./img/grad1.jpg",
      wireframe:true,
      camera:{pos:[220 ,5,115],lookAt:[0,0,0]},
      box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
      color:0x99ccff,
  },
{
      img:"./img/grad1.jpg",
      wireframe:false,
      camera:{pos:[-20 ,5,-15],lookAt:[0,0,0]},
      box:{pos:[0,120,0],scale:[1,1,1],rot:[0,0,0],},
      color:0x9999ff,
  },
  ];
}

function onLoadIslandWater() {
  document.getElementById("loadingWater").className += " finishedLoading";
  document.getElementById("mainlogo").className += document.getElementById("mainlogo").className.replace("none", "");
  
  const ffontLoader = new THREE.FontLoader();
  setTimeout(() => {
    loadIslandSand(scene)
    initDunoText(scene, ffontLoader)
  }, 1000);
  setTimeout(() => loadIslandRock(scene), 3000);
  setTimeout(() => loadIslandMountain(scene), 5000);
  setTimeout(() => loadIslandGreen(scene), 7000);
  setTimeout(() => loadIslandLightGreen(scene), 7000);
  setTimeout(() => initTexts(scene, ffontLoader), 9000);
}

function initTexts(scene, ffontLoader) {
  initAboutText(scene, ffontLoader);
  initWebText(scene, ffontLoader);
  initCodeText(scene, ffontLoader);
  setTimeout(() => {
    initArtText(scene, ffontLoader);
    initGamesText(scene, ffontLoader);
  }, 6000);
}

function addBoxesToScene() {
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.BoxGeometry(colors[i].box.scale[0], colors[i].box.scale[1], colors[i].box.scale[2]);
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ wireframe: colors[i].wireframe, map: THREE.ImageUtils.loadTexture(colors[i].img) }));
    
    object.position.set(colors[i].box.pos[0], colors[i].box.pos[1], (-0.9 * i) + colors[i].box.pos[2]);
    object.rotation.set(colors[i].box.rot[0], colors[i].box.rot[1], colors[i].box.rot[2]);
    object.scale.set(10, Math.max(10 - i * 2, 1), 10);
    
    scene.add(object);
  }
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
  totalTimeElapsed += 1;
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (orange) {
    let asd = parseInt(INTERSECTED.id);
    orangeLevel += asd;
  }

  theta += tRate;
  tRate += 0.0001;

  camera.updateMatrixWorld();
  
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, false);

  if (intersects.length > 0) {
    handleIntersect(intersects[0].object);
  } else {
    if (INTERSECTED) INTERSECTED?.material?.emissive?.setHex(INTERSECTED.currentHex);
    if (orange) orangeLevel -= parseInt(orangeLevel / 2);
    orange = false;
    INTERSECTED = null;
  }

  if (SELECTED) {
    updateCameraPosition(camera, colors, SELECTED, totalTimeElapsed, THEINDEX);
  }

  renderer.render(scene, camera);
}

function handleIntersect(intersectedObject) {
  if (INTERSECTED != intersectedObject) {
    if (INTERSECTED?.material?.emissive) {
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
    }

    INTERSECTED = intersectedObject;
    if (INTERSECTED.id > 10 && INTERSECTED.id <= 21) orange = true;

    if (INTERSECTED?.material?.emissive) {
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex(0x005500);
    }

    if (INTERSECTED.name in actionsLookup) {
      const lookupItem = actionsLookup[INTERSECTED.name];
      if (lookupItem.goToIndex && !document.getElementById("loadingWater").className.includes("finishedLoading") || totalTimeElapsed < 9) {
        return;
      }
      if (isMobileDevice()) {
        setTimeout(() => handleEvent({}), 300);
      }
    }
  }
}

function isMobileDevice() {
  let hasTouchScreen = false;
  let isMobileUA = false;

  if ("maxTouchPoints" in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ("msMaxTouchPoints" in navigator) {
    hasTouchScreen = navigator.msMaxTouchPoints > 0;
  } else if (window.matchMedia && matchMedia("(pointer:coarse)").matches) {
    hasTouchScreen = true;
  } else if ('orientation' in window) {
    hasTouchScreen = true;
  } else {
    const userAgent = navigator.userAgent;
    isMobileUA = /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
  }

  if (hasTouchScreen && !isMobileUA && window.innerWidth > 800) {
    hasTouchScreen = false;
  }

  return hasTouchScreen || isMobileUA;
}
