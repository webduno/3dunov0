
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

import * as THREE from 'three';









function handleEvent(e) {
  if (INTERSECTED && INTERSECTED.name in actionsLookup) {
    const lookupItem = actionsLookup[INTERSECTED.name];
    
    var sceness = document.querySelectorAll('.amodalscreen');
    let modalAlreadyOpen = false;
    sceness.forEach(function(adomscene) {
      if (!adomscene.classList.contains('none')) {
        modalAlreadyOpen = true;
        return; // Early return if a modal is already open
      }
    });
    
    
    if (modalAlreadyOpen) {
      return;
    } else {
      if (INTERSECTED?.material?.emissive) {
        INTERSECTED.material.emissive.setHex(0x000000);
      }
    }
    
    let theIndex = lookupItem.goToIndex;
    if (theIndex == THEINDEX) { return; }
    THEINDEX = theIndex;
    SELECTED = { ...scene.children[theIndex + 1] };
    CLICKED = { ...scene.children[theIndex + 1] };
    INTERSECTED = { ...scene.children[theIndex + 1] };
    
    camera.lookAt(
      SELECTED.position.x + colors[theIndex].camera.lookAt[0],
      SELECTED.position.y + colors[theIndex].camera.lookAt[1],
      SELECTED.position.z + colors[theIndex].camera.lookAt[2]
    );
    
    sceness.forEach(function(adomscene) {
      if ("modal" + theIndex != adomscene.id) {
        adomscene.className += " none";
      }
    });
    if (document.getElementById("modal" + theIndex)) {
      document.getElementById("modal" + theIndex).classList.toggle("none");
    }
  }
}














const actionsLookup = {
  "about_section": {
    msg: "Hello World",
    goToIndex: 1,
  },
  "art_section": {
    msg: "Hello World",
    goToIndex: 2,
  },
  "code_section": {
    msg: "Hello World",
    goToIndex: 3,
  },
  "game_section": {
    msg: "Hello World",
    goToIndex: 4,
  },
  "contact_section": {
    msg: "Hello World",
    goToIndex: 5,
  },
}
const lerp = (x, y, a) => x * (1 - a) + y * a;
const loadedWater = false
let totalTimeElapsed = 0
let tRate = 0.5
let container;
let camera, scene, raycaster, renderer;

let INTERSECTED;
let CLICKED;
let colors;
let SELECTED;
let THEINDEX;
let light;
let theta = 0;

const pointer = new THREE.Vector2();
const radius = 100;

let orange = false;
let orangeLevel = 0;
let orangeDOM;

let desire = [];

init();
animate();











function init() {
  var closes = document.querySelectorAll('.selfCloseButton')
  closes.forEach(function(adombutton) {
    // adombutton is the current element
    adombutton.onclick = function(e) {
      e.currentTarget.parentNode.parentNode.parentNode.classList.toggle("none")
      // document.getElementById("modal"+(-(Math.floor(CLICKED.position.z/90)))).classList.toggle("none")
      // }
    }
  })
  var sceness = document.querySelectorAll('.scene-goto')
  sceness.forEach(function(adomscene) {
    // adomscene is the current element
    adomscene.onclick = function(e) {
      let theIndex = parseInt(e.currentTarget.id.replace("scene",""))
      THEINDEX =  theIndex
      SELECTED =  {...scene.children[theIndex+1]}
      CLICKED =   {...scene.children[theIndex+1]}
      INTERSECTED =   {...scene.children[theIndex+1]}
      
      camera.lookAt(
        SELECTED.position.x + colors[theIndex].camera.lookAt[0],
        SELECTED.position.y + colors[theIndex].camera.lookAt[1],
        SELECTED.position.z + colors[theIndex].camera.lookAt[2]
      )
      
      var sceness = document.querySelectorAll('.amodalscreen')
      sceness.forEach(function(adomscene) {
        if ("modal"+theIndex != adomscene.id)
          {
          adomscene.className += " none"
        } else {
        }
      })
      if ( document.getElementById("modal"+theIndex ) )
        {
        document.getElementById("modal"+theIndex ).classList.toggle("none")
      }
      
    }
  });
  
  document.addEventListener("mousedown", handleEvent);
  document.addEventListener("touchstart", handleEvent);
  
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  
  camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 10000 );
  camera.position.z = 50
  camera.lookAt(0,0,0)
  
  scene = new THREE.Scene();
  
  light = new THREE.PointLight( 0xFFDE9F, 1.5, 100 );
  light.position.set( 40, 10, 40 );
  light.castShadow = true;            
  scene.add( light );
  
  
  light = new THREE.PointLight( 0xFFDE9F, 1, 75 );
  light.position.set( -15, 5, -50 );
  light.castShadow = true;           
  scene.add( light );
  
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  colors = [
    {
      img:"./img/wp2100821-1187062037.jpg",
      wireframe:false,
      camera:{pos:[0,0,0],lookAt:[0,0,0]},
      box:{pos:[0,0,0],scale:[0,0,0],rot:[0,0,0],},
      color:0xff9999,
    },
    
    
    
    
    
    {
      img:"./img/grrrid.jpg",
      wireframe:false,
      camera:{pos:[30,30,90],lookAt:[0,0,0]},
      box:{pos:[0, -0,0],scale:[0,0,0],rot:[0,0,(3.14/4)*3],},
      color:0xff9999,
    },
    
    
    
    
    
    {
      img:"./img/th-1084040338.jpg",
      wireframe:false,
      camera:{pos:[50 ,5,55],lookAt:[0,0,0]},
      box:{pos:[0,0,0],scale:[0,0,0],rot:[0,0,0],},
      color:0xffcc99,
    },                           
    
    {
      img:"./img/th-813177686.jpg",
      wireframe:false,
      camera:{pos:[-20 ,-10,20],lookAt:[0,0,0]},
      box:{pos:[0,0,0],scale:[0,0,0],rot:[0.0,0,0],},
      color:0xffff99,
    },                
    {
      img:"./img/grad5.jpg",
      wireframe:false,
      camera:{pos:[59 ,7,-66],lookAt:[0,0,0]},
      box:{pos:[0,0,-0],scale:[0,0,0],rot:[0,0,0],},
      color:0xccff99,
    },
    
    
  ]
  
  loadIslandWater(scene,  () => {
    document.getElementById("loadingWater").className += " finishedLoading"
    document.getElementById("mainlogo").className += document.getElementById("mainlogo").className.replace("none","")
    
    setTimeout(() => {
      loadIslandSand(scene)
    }, 1000);
    setTimeout(() => {
      loadIslandRock(scene)
    }, 2000);
    setTimeout(() => {
      loadIslandWater(scene)
    }, 3000);
    setTimeout(() => {
      loadIslandMountain(scene)
    }, 4000);
    setTimeout(() => {
      loadIslandGreen(scene)
    }, 5000);
    setTimeout(() => {
      loadIslandLightGreen(scene)
    }, 6000);

    
    setTimeout(() => {
      
          
          
      
      const ffontLoader = new THREE.FontLoader();
      initAboutText(scene, ffontLoader)
      initDunoText(scene, ffontLoader)
      initWebText(scene, ffontLoader)

      initArtText(scene, ffontLoader)
      initCodeText(scene, ffontLoader)
      initGamesText(scene, ffontLoader)

      
    }, 9000);
    
  })
  
  
  
    
          for ( let i = 0; i < 5; i ++ ) {
            const geometry = new THREE.BoxGeometry( colors[i].box.scale[0],colors[i].box.scale[1],colors[i].box.scale[2] );
            
            const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({ wireframe: colors[i].wireframe, map: THREE.ImageUtils.loadTexture(colors[i].img) }) );
            
            object.position.z = (-0.9*i) + colors[i].box.pos[2]
            object.position.y = colors[i].box.pos[1]
            object.position.x = colors[i].box.pos[0]
            object.rotation.x = colors[i].box.rot[0]
            object.rotation.y = colors[i].box.rot[1]
            object.rotation.z = colors[i].box.rot[2]
            object.scale.x = 10
            object.scale.y = 10 - i*2 < 1 ? 1 : 10 - i*2
            object.scale.z = 10
            
            
            scene.add( object );
            
          }
          
          raycaster = new THREE.Raycaster();
          
          renderer = new THREE.WebGLRenderer({ alpha: true });
          
          renderer.setPixelRatio( window.devicePixelRatio );
          renderer.setSize( window.innerWidth, window.innerHeight );
          container.appendChild( renderer.domElement );
          
          
          
          document.addEventListener( 'mousemove', onPointerMove );
          
          
          window.addEventListener( 'resize', onWindowResize );
          
        }
        
        function onWindowResize() {
          
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          
          renderer.setSize( window.innerWidth, window.innerHeight );
          
        }
        
        function onPointerMove( event ) {
          
          pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
          
        }
        function animate() {
          totalTimeElapsed += 1
          requestAnimationFrame( animate );
          
          render();
        }
        
        function render() {
          if (orange)
            {
            let asd = parseInt(INTERSECTED.id)
            orangeLevel += asd
          } else {
          }
          
          theta += tRate;
          tRate += 0.0001;
          
          
          camera.updateMatrixWorld();
          
          
          if (INTERSECTED && INTERSECTED.position.y < 0)
            {
            
          }
          
          raycaster.setFromCamera( pointer, camera );
          
          const intersects = raycaster.intersectObjects( scene.children, false );
          
          if ( intersects.length > 0 ) {
            
            if ( INTERSECTED != intersects[ 0 ].object ) {
              
              if ( INTERSECTED )
                {
                if(INTERSECTED?.material?.emissive) { INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex ); }
              }
              
              INTERSECTED = intersects[ 0 ].object;
              if (INTERSECTED.id > 10 && INTERSECTED.id <= 21)
                {
                orange = true
              }
              if(INTERSECTED?.material?.emissive) { INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex(); }
              if(INTERSECTED?.material?.emissive) { INTERSECTED.material.emissive.setHex( 0x005500 ); }
              
              if (INTERSECTED.name in actionsLookup) {
                const lookupItem = actionsLookup[INTERSECTED.name]
                if (lookupItem.goToIndex) {
                  if (!                    document.getElementById("loadingWater").className.includes("finishedLoading") || totalTimeElapsed < 9 ) {
                    
                    return;
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
                      hasTouchScreen = true; // This is a deprecated method but a good fallback.
                    } else {
                      const userAgent = navigator.userAgent;
                      isMobileUA = /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
                    }
                    
                    // Ensure it's truly a mobile device and not a desktop with touch support
                    if (hasTouchScreen) {
                      if (!isMobileUA && window.innerWidth > 800) {
                        hasTouchScreen = false;
                      }
                    }
                    
                    return hasTouchScreen || isMobileUA;
                  }
                  if (isMobileDevice()) {
                    // alert()
                    setTimeout(()=>{
                      handleEvent({})
                    }, 300)
                  }
                }
              }
            }
          } else {
            
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            if (orange)
              {
              orangeLevel -= parseInt(orangeLevel / 2)
            }
            orange = false
            
            INTERSECTED = null;
            
          }
          
          if (SELECTED) {
            
            camera.position.z = lerp(
              camera.position.z,
              SELECTED.position.z + 26+(colors[THEINDEX] ? colors[THEINDEX].camera.pos[2]:0 ),
              0.25)
              if (colors[THEINDEX])
                {
                camera.position.x = lerp(camera.position.x ,colors[THEINDEX].camera.pos[0],.05)
                camera.position.y = lerp(camera.position.y ,colors[parseInt(THEINDEX)].camera.pos[1],.05)
              }
              camera.lookAt( SELECTED.position.x, SELECTED.position.y+colors[parseInt(THEINDEX)].camera.lookAt[1], SELECTED.position.z   );
            } else {
            }
            camera.position.y = camera.position.y+ Math.sin(totalTimeElapsed/20)/80
            
            renderer.render( scene, camera );
            
          }